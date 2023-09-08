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
  };
  logger: {
    logstashHost: string;
    logstashPort: number;
    logstashLevel: string;
  };
  redis: RedisConfig;
}

export const configuration: IConfig = {
  maxCPU: parseInt(process.env.MAX_CPU!, 10) || 1,
  serviceName: process.env.FUNCTION_NAME as string,
  apm: {
    url: process.env.APM_URL as string,
    secretToken: process.env.APM_SECRET_TOKEN as string,
    active: process.env.APM_ACTIVE as string,
  },
  db: {
    password: process.env.DATABASE_PASSWORD as string,
    url: process.env.DATABASE_URL as string,
    user: process.env.DATABASE_USER as string,
    configurationDb: process.env.CONFIGURATION_DB as string,
    transactionHistoryDb: process.env.TRANSACTION_HISTORY_DB as string,
    transactionDb: process.env.TRANSACTION_DB as string,
    dbCertPath: process.env.DATABASE_CERT_PATH as string,
  },
  env: process.env.NODE_ENV as string,
  logger: {
    logstashHost: process.env.LOGSTASH_HOST as string,
    logstashPort: parseInt(process.env.LOGSTASH_PORT ?? '0', 10),
    logstashLevel: (process.env.LOGSTASH_LEVEL as string) || 'info',
  },
  redis: {
    db: parseInt(process.env.REDIS_DB!, 10) || 0,
    servers: JSON.parse((process.env.REDIS_SERVERS as string) || '[{"hostname": "127.0.0.1", "port":6379}]'),
    password: process.env.REDIS_AUTH as string,
    isCluster: process.env.REDIS_IS_CLUSTER === 'true',
  },
};
