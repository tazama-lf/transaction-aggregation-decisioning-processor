// SPDX-License-Identifier: Apache-2.0
import type { DatabaseManagerInstance, ManagerConfig } from '@tazama-lf/frms-coe-lib';
import { Database } from '@tazama-lf/frms-coe-lib/lib/config/database.config';
import { Cache } from '@tazama-lf/frms-coe-lib/lib/config/redis.config';
import { CreateStorageManager } from '@tazama-lf/frms-coe-lib/lib/services/dbManager';
import type { Configuration } from '../config';
import { databaseManager, loggerService, configuration, server } from '..';
import { getRoutesFromNetworkMap } from '@tazama-lf/frms-coe-lib/lib/helpers/networkMapIdentifiers';
import type { MsgHdrs } from 'nats';
import { handleExecute } from './logic.service';

/* eslint-disable @typescript-eslint/no-extraneous-class -- singleton */
export class Singleton {
  private static dbManager: DatabaseManagerInstance<Configuration>;

  public static async getDatabaseManager(
    configuration: Configuration,
  ): Promise<{ db: DatabaseManagerInstance<Configuration>; config: ManagerConfig }> {
    if (!Singleton.dbManager) {
      const requireAuth = configuration.nodeEnv === 'production';

      const { db } = await CreateStorageManager<typeof configuration>(
        [Database.CONFIGURATION, Database.EVALUATION, Cache.LOCAL, Cache.DISTRIBUTED],
        requireAuth,
      );

      Singleton.dbManager = db;
    }
    return { db: Singleton.dbManager, config: configuration };
  }
}

/* eslint-enable @typescript-eslint/no-extraneous-class -- singleton */
export async function handleReload(object: unknown): Promise<void> {
  loggerService.log('Hot-Reloading...');
  loggerService.log('Getting new Network Map for Subscription subjects', 'updateConfig');

  const { consumers } = await getRoutesFromNetworkMap(databaseManager, configuration.functionName);

  const { headers } = object as { message: unknown; headers: MsgHdrs | null };
  if (headers?.get('config-type') === 'network-map' || headers?.get('config-type') === 'typology-config') {
    loggerService.log('Clearing node cache');
    databaseManager.nodeCache?.flushAll();

    loggerService.log('Re-subscribing', 'updateConfig');
    if (!(await server.init(handleExecute, loggerService, consumers, configuration.ALERT_PRODUCER))) {
      loggerService.log('Failed to re-subscript to nats', 'updateConfig');
    } else {
      loggerService.log('Completed re-subscription after config update', 'updateConfig');
    }
  }
}
