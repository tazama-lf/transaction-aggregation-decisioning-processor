// SPDX-License-Identifier: Apache-2.0
// config settings, env variables
import type { ManagerConfig } from '@tazama-lf/frms-coe-lib';
import type { AdditionalConfig, ProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export interface ExtendedConfig {
  ALERT_PRODUCER: string;
  SUPPRESS_ALERTS: boolean;
  ALERT_DESTINATION: 'global' | 'tenant';
}

export const additionalEnvironmentVariables: AdditionalConfig[] = [
  {
    name: 'SUPPRESS_ALERTS',
    type: 'boolean',
    optional: false,
  },
  {
    name: 'ALERT_PRODUCER',
    type: 'string',
    optional: false,
  },
  {
    name: 'ALERT_DESTINATION',
    type: 'string',
    optional: false,
  },
];

export type DatabasesConfig = Omit<Required<ManagerConfig>, 'pseudonyms'>;
export type Configuration = ProcessorConfig & DatabasesConfig & ExtendedConfig;
