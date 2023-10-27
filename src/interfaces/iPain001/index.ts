// SPDX-License-Identifier: Apache-2.0
import { GrpHdr } from './GrpHdr';
import { PmtInf } from './PmtInf';
import { SplmtryData } from './SplmtryData';

class CstmrCdtTrfInitn {
  MsgId = '';
  GrpHdr: GrpHdr = new GrpHdr();
  PmtInf: PmtInf = new PmtInf();
  SplmtryData: SplmtryData = new SplmtryData();
}

export class IPain001Message {
  TxTp = 'pain.001.001.11';
  CstmrCdtTrfInitn: CstmrCdtTrfInitn = new CstmrCdtTrfInitn();
}
