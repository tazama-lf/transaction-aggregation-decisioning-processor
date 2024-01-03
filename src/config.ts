// SPDX-License-Identifier: Apache-2.0
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// config settings, env variables
import * as path from 'path';
import * as dotenv from 'dotenv';
import { type RedisConfig } from '@frmscoe/frms-coe-lib/lib/interfaces';

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export interface IConfig {
  maxCPU: number;
  env: string;
  serviceName: string;
  apm: {
    secretToken: string;
    url: string;
    active: string;
  };
  db: {
    password: string;
    url: string;
    user: string;
    configurationDb: string;
    transactionDb: string;
    transactionHistoryDb: string;
    dbCertPath: string;
    cacheEnabled: boolean;
    cacheTTL: number;
    networkMap: string;
  };
  logger: {
    logstashHost: string;
    logstashPort: number;
    logstashLevel: string;
  };
  redis: RedisConfig;
  sidecarHost: string;
  producerStream: string;
}

export const configuration: IConfig = {
  maxCPU: parseInt(process.env.MAX_CPU!, 10) || 1,
  serviceName: process.env.FUNCTION_NAME!,
  apm: {
    url: process.env.APM_URL!,
    secretToken: process.env.APM_SECRET_TOKEN!,
    active: process.env.APM_ACTIVE!,
  },
  db: {
    password: process.env.DATABASE_PASSWORD!,
    url: process.env.DATABASE_URL!,
    user: process.env.DATABASE_USER!,
    configurationDb: process.env.CONFIGURATION_DB!,
    transactionHistoryDb: process.env.TRANSACTION_HISTORY_DB!,
    transactionDb: process.env.TRANSACTION_DB!,
    dbCertPath: process.env.DATABASE_CERT_PATH!,
    cacheEnabled: process.env.CACHE_ENABLED === 'true',
    cacheTTL: parseInt(process.env.CACHE_TTL!, 10) || 3000,
    networkMap: process.env.DATABASE_NETWORKMAP!,
  },
  env: process.env.NODE_ENV!,
  logger: {
    logstashHost: process.env.LOGSTASH_HOST!,
    logstashPort: parseInt(process.env.LOGSTASH_PORT ?? '0', 10),
    logstashLevel: process.env.LOGSTASH_LEVEL! || 'info',
  },
  redis: {
    db: parseInt(process.env.REDIS_DB!, 10) || 0,
    servers: JSON.parse(process.env.REDIS_SERVERS! || '[{"hostname": "127.0.0.1", "port":6379}]'),
    password: process.env.REDIS_AUTH!,
    isCluster: process.env.REDIS_IS_CLUSTER === 'true',
  },
  sidecarHost: process.env.SIDECAR_HOST!,
  producerStream: process.env.PRODUCER_STREAM!,
};
