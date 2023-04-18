/* eslint-disable @typescript-eslint/no-non-null-assertion */
// config settings, env variables
import * as path from 'path';
import * as dotenv from 'dotenv';

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
  redis: {
    auth: string;
    db: string;
    host: string;
    port: number;
  };
  cmsEndpoint: string;
}

export const configuration: IConfig = {
  maxCPU: parseInt(process.env.MAX_CPU!, 10) || Number.MAX_SAFE_INTEGER,
  serviceName: <string>process.env.FUNCTION_NAME,
  apm: {
    url: <string>process.env.APM_URL,
    secretToken: <string>process.env.APM_SECRET_TOKEN,
    active: <string>process.env.APM_ACTIVE,
  },
  db: {
    name: <string>process.env.DATABASE_NAME,
    password: <string>process.env.DATABASE_PASSWORD,
    url: <string>process.env.DATABASE_URL,
    user: <string>process.env.DATABASE_USER,
    collectionName: <string>process.env.COLLECTION_NAME,
    transactionConfigDb: <string>process.env.TRANSACTION_CONFIG_DB,
    transactionConfigCollection: <string>process.env.TRANSACTION_CONFIG_COLLECTION,
  },
  env: <string>process.env.NODE_ENV,
  logstash: {
    host: <string>process.env.LOGSTASH_HOST,
    port: parseInt(process.env.LOGSTASH_PORT!, 10),
  },
  port: parseInt(process.env.PORT!, 10) || 3000,
  redis: {
    auth: <string>process.env.REDIS_AUTH,
    db: <string>process.env.REDIS_DB,
    host: <string>process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!, 10),
  },
  cmsEndpoint: <string>process.env.CMS_ENDPOINT,
};
