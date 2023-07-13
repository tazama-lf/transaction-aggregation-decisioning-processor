import { v4 } from 'uuid';
import { TADPResult } from './tadp-result';

export class Alert {
  evaluationID = v4();
  status = ''; // eg ALRT
  prcgTmCRSP = 0;
  prcgDP = 0;
  timestamp: Date = new Date();
  tadpResult: TADPResult = new TADPResult();
}
