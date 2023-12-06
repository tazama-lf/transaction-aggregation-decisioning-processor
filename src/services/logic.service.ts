// SPDX-License-Identifier: Apache-2.0
/* eslint-disable @typescript-eslint/no-explicit-any */
import apm from '../apm';
import { Alert } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/Alert';
import { CalculateDuration } from '@frmscoe/frms-coe-lib/lib/helpers/calculatePrcg';
import { databaseManager, loggerService, server } from '../index';
import { handleTypologies } from './helper.service';
import { type Pacs002, type NetworkMap } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { type CMSRequest } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/CMSRequest';
import { type TADPResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TADPResult';
import { type TypologyResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';
import { type MetaData } from '@frmscoe/frms-coe-lib/lib/interfaces/metaData';

export const handleExecute = async (rawTransaction: any): Promise<any> => {
  const functionName = 'handleExecute()';
  let apmTransaction = null;
  try {
    const startTime = process.hrtime.bigint();

    // Get the request body and parse it to variables
    const metaData = rawTransaction?.metaData as MetaData;
    const transaction = rawTransaction.transaction as Pacs002;
    const transactionType = 'FIToFIPmtSts';
    const transactionID = transaction[transactionType].GrpHdr.MsgId;
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

    // Messages is hardcoded at the moment since we only ever have 1. Should we move to include more messages, we will have to revist.
    const channel = networkMap.messages[0].channels.filter((c) =>
      c.typologies.some((t) => t.id === typologyResult.id && t.cfg === typologyResult.cfg),
    )[0];

    loggerService.debug(`Processing Channel ${channel.id}.`, functionName, transactionID);
    const { channelResults, review } = await handleTypologies(transaction, channel, networkMap, typologyResult);

    if (channelResults.length > 0 && channelResults.length === networkMap.messages[0].channels.length) {
      toReturn.id = networkMap.messages[0].id;
      toReturn.cfg = networkMap.messages[0].cfg;
      toReturn.channelResult = channelResults;
      toReturn.prcgTm = CalculateDuration(startTime);

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

      const spanInsertTransactionHistory = apm.startSpan('db.insert.transactionHistory');
      await databaseManager.insertTransaction(transactionID, transaction, networkMap, alert);
      spanInsertTransactionHistory?.end();
      result.report.tadpResult.prcgTm = CalculateDuration(startTime);
      await server.handleResponse(result);
    }
    apmTransaction?.end();
    return channelResults;
  } catch (e) {
    loggerService.error('Error while calculating Transaction score', e as Error, functionName);
  } finally {
    apmTransaction?.end();
  }
};
