/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Pacs002, type NetworkMap, type Channel } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { Alert } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/Alert';
import { type CMSRequest } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/CMSRequest';
import { type ChannelResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/ChannelResult';
import { type TADPResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TADPResult';
import { type TypologyResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';
import apm from '../apm';
import { databaseManager, loggerService, server } from '../index';
import { type MetaData } from '../interfaces/metaData';
import { calculateDuration, handleTypologies } from './helper.service';

export const handleExecute = async (rawTransaction: any): Promise<any> => {
  let apmTransaction = null;
  try {
    const startTime = process.hrtime.bigint();

    // Get the request body and parse it to variables
    const metaData = rawTransaction?.metaData as MetaData;
    const transaction = rawTransaction.transaction as Pacs002;
    const networkMap = rawTransaction.networkMap as NetworkMap;
    const typologyResult = rawTransaction.typologyResult as TypologyResult;

    // const channelResult = rawTransaction.channelResult as ChannelResult;
    const traceParent = metaData?.traceParent ?? undefined;
    apmTransaction = apm.startTransaction('handle.execute', {
      childOf: traceParent,
    });

    // Send every channel request to the service function
    const toReturn: TADPResult = {
      id: '',
      cfg: '',
      channelResult: [],
      prcgTm: 0,
    };

    const channel = networkMap.messages[0].channels.filter((c) =>
      c.typologies.some((t) => t.id === typologyResult.id && t.cfg === typologyResult.cfg),
    )[0];

    loggerService.debug(`Processing Channel ${channel.id}.`);
    let review = false;
    const channelResults: ChannelResult[] = await handleTypologies(transaction, channel, networkMap, typologyResult, metaData);

    if (channelResults.length > 0 && channelResults.length === networkMap.messages[0].channels.length) {
      if (channelResults.some((c: ChannelResult) => c.status === 'Review')) review = true;
      toReturn.channelResult = channelResults;
      toReturn.prcgTm = calculateDuration(startTime);
      const alert = new Alert();
      alert.tadpResult = toReturn;
      alert.status = review ? 'ALRT' : 'NALT';
      alert.metaData = metaData;
      const result: CMSRequest = {
        message: `Successfully completed ${channelResults.length} channels`,
        report: alert,
        transaction,
        networkMap,
      };

      const transactionType = 'FIToFIPmtSts';
      const transactionID = transaction[transactionType].GrpHdr.MsgId;
      const spanInsertTransactionHistory = apm.startSpan('db.insert.transactionHistory');
      await databaseManager.insertTransaction(transactionID, transaction, networkMap, alert);
      spanInsertTransactionHistory?.end();
      result.report.tadpResult.prcgTm = calculateDuration(startTime);
      await server.handleResponse(result);
    }
    apmTransaction?.end();
    return channelResults;
  } catch (e) {
    loggerService.error('Error while calculating Transaction score', e as Error);
  } finally {
    apmTransaction?.end();
  }
};
