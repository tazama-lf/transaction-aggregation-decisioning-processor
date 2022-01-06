/* eslint-disable */
import { Alert } from './alert';
import { NetworkMap } from './network-map';

export class CMSRequest {
  message = '';
  alert: Alert = new Alert();
  transaction: any;
  networkMap: NetworkMap = new NetworkMap();
}
