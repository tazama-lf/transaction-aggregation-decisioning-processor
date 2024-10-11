// SPDX-License-Identifier: Apache-2.0
// config settings, env variables
import * as path from 'path';
import * as dotenv from 'dotenv';
import { type ManagerConfig } from '@tazama-lf/frms-coe-lib';
import {
  validateDatabaseConfig,
  validateEnvVar,
  validateLogConfig,
  validateRedisConfig,
  validateAPMConfig,
  validateProcessorConfig,
  validateLocalCacheConfig,
} from '@tazama-lf/frms-coe-lib/lib/helpers/env';
import { Database } from '@tazama-lf/frms-coe-lib/lib/helpers/env/database.config';
import { type ApmConfig, type LogConfig } from '@tazama-lf/frms-coe-lib/lib/helpers/env/monitoring.config';

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export interface IConfig {
  maxCPU: number;
  env: string;
  serviceName: string;
  apm: ApmConfig;
  db: ManagerConfig;
  logger: LogConfig;
  producerStream: string;
  suppressAlerts: boolean;
}

const generalConfig = validateProcessorConfig();
const authEnabled = generalConfig.nodeEnv === 'production';
const redisConfig = validateRedisConfig(authEnabled);
const transactionHistory = validateDatabaseConfig(authEnabled, Database.TRANSACTION_HISTORY);
const transaction = validateDatabaseConfig(authEnabled, Database.TRANSACTION);
const configDBConfig = validateDatabaseConfig(authEnabled, Database.CONFIGURATION);
const apm = validateAPMConfig();
const logger = validateLogConfig();
const localCacheConfig = validateLocalCacheConfig();

export const configuration: IConfig = {
  maxCPU: generalConfig.maxCPU || 1,
  serviceName: generalConfig.functionName,
  apm,
  db: {
    redisConfig,
    configuration: configDBConfig,
    transactionHistory,
    transaction,
    localCacheConfig,
  },
  env: generalConfig.nodeEnv || 'dev',
  logger,
  producerStream: validateEnvVar('PRODUCER_STREAM', 'string'),
  suppressAlerts: validateEnvVar('SUPPRESS_ALERTS', 'boolean'),
};
