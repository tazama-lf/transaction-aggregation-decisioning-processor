import { v4 } from 'uuid';
import { TADPResult } from './tadp-result';

export class Alert {
  metaData?: { prcgTmDp: number; prcgTmCRSP: number };
  evaluationID = v4();
  status = ''; // eg ALRT
  prcgTmCRSP = 0;
  prcgTmDP = 0;
  timestamp: Date = new Date();
  tadpResult: TADPResult = new TADPResult();
}
