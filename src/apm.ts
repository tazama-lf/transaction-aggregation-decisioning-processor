import { Apm } from '@frmscoe/frms-coe-lib/lib/services/apm';
import { configuration } from './config';
/*
 * Initialize the APM Logging
 **/
const apm = new Apm({
  serviceName: configuration.serviceName,
  secretToken: configuration.apm?.secretToken,
  serverUrl: configuration.apm?.url,
  usePathAsTransactionName: true,
  active: Boolean(configuration.apm?.active),
  transactionIgnoreUrls: ['/health'],
});

export default apm;
