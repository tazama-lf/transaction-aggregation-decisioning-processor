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
  port: number;
  serviceName: string;
  apm: {
    secretToken: string;
    url: string;
    active: string;
  };
  db: {
    name: string;
    password: string;
    url: string;
    user: string;
    collectionName: string;
    transactionConfigDb: string;
    transactionConfigCollection: string;
  };
  logstash: {
    host: string;
    port: number;
  };
  redis: RedisConfig;
  cmsEndpoint: string;
}

export const configuration: IConfig = {
  maxCPU: parseInt(process.env.MAX_CPU!, 10) || 0,
  serviceName: process.env.FUNCTION_NAME as string,
  apm: {
    url: process.env.APM_URL as string,
    secretToken: process.env.APM_SECRET_TOKEN as string,
    active: process.env.APM_ACTIVE as string,
  },
  db: {
    name: process.env.DATABASE_NAME as string,
    password: process.env.DATABASE_PASSWORD as string,
    url: process.env.DATABASE_URL as string,
    user: process.env.DATABASE_USER as string,
    collectionName: process.env.COLLECTION_NAME as string,
    transactionConfigDb: process.env.TRANSACTION_CONFIG_DB as string,
    transactionConfigCollection: process.env.TRANSACTION_CONFIG_COLLECTION as string,
  },
  env: process.env.NODE_ENV as string,
  logstash: {
    host: process.env.LOGSTASH_HOST as string,
    port: parseInt(process.env.LOGSTASH_PORT!, 10),
  },
  port: parseInt(process.env.PORT!, 10) || 3000,
  redis: {
    db: parseInt(process.env.REDIS_DB!, 10) || 0,
    servers: JSON.parse((process.env.REDIS_SERVERS as string) || '[{"hostname": "127.0.0.1", "port":6379}]'),
    password: process.env.REDIS_AUTH as string,
    isCluster: process.env.REDIS_IS_CLUSTER === 'true',
  },
  cmsEndpoint: process.env.CMS_ENDPOINT as string,
};
