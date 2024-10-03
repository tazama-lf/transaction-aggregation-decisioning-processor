// SPDX-License-Identifier: Apache-2.0
import { Apm } from '@tazama-lf/frms-coe-lib/lib/services/apm';
import { configuration } from './config';
/*
 * Initialize the APM Logging
 **/
const apm = new Apm({
  serviceName: configuration.serviceName,
  secretToken: configuration.apm?.apmSecretToken,
  serverUrl: configuration.apm?.apmUrl,
  usePathAsTransactionName: true,
  active: configuration.apm?.apmActive,
  transactionIgnoreUrls: ['/health'],
});

export default apm;
