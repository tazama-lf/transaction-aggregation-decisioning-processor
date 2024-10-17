// SPDX-License-Identifier: Apache-2.0
// config settings, env variables
import * as path from 'path';
import * as dotenv from 'dotenv';
import type { AdditionalConfig, ProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import type { DatabasesConfig } from './services/services';

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export interface ExtendedConfig {
  PRODUCER_STREAM: string;
  SUPPRESS_ALERTS: boolean;
}

export const additionalEnvironmentVariables: AdditionalConfig[] = [
  {
    name: 'SUPPRESS_ALERTS',
    type: 'boolean',
    optional: false,
  },
  {
    name: 'PRODUCER_STREAM',
    type: 'string',
    optional: false,
  },
];

export type Configuration = ProcessorConfig & DatabasesConfig & ExtendedConfig;
