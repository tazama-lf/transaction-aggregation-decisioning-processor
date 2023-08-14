/* eslint-disable */
import { NetworkMap } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { Alert } from './alert';

export class CMSRequest {
  message = '';
  alert: Alert = new Alert();
  transaction: any;
  networkMap: NetworkMap = new NetworkMap();
}
