// SPDX-License-Identifier: Apache-2.0
import type { DatabaseManagerInstance, ManagerConfig } from '@tazama-lf/frms-coe-lib';
import { Database } from '@tazama-lf/frms-coe-lib/lib/config/database.config';
import type { ProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import { Cache } from '@tazama-lf/frms-coe-lib/lib/config/redis.config';
import { CreateStorageManager } from '@tazama-lf/frms-coe-lib/lib/services/dbManager';
/* eslint-disable @typescript-eslint/no-extraneous-class */
export type DatabasesConfig = Omit<Required<ManagerConfig>, 'pseudonyms'>;
export class Singleton {
  private static dbManager: { db: DatabaseManagerInstance<DatabasesConfig>; config: ManagerConfig };

  public static async getDatabaseManager(
    configuration: ProcessorConfig,
  ): Promise<{ db: DatabaseManagerInstance<DatabasesConfig>; config: ManagerConfig }> {
    const requireAuth = configuration.nodeEnv === 'production';
    if (!Singleton.dbManager) {
      Singleton.dbManager = await CreateStorageManager(
        [Database.EVALUATION, Database.CONFIGURATION, Database.TRANSACTION_HISTORY, Cache.LOCAL, Cache.DISTRIBUTED],
        requireAuth,
      );
    }

    return Singleton.dbManager;
  }
}
