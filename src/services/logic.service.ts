// SPDX-License-Identifier: Apache-2.0
import apm from '../apm';
import { Alert } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/Alert';
import { CalculateDuration } from '@tazama-lf/frms-coe-lib/lib/helpers/calculatePrcg';
import { configuration, databaseManager, loggerService, server } from '../index';
import { handleTypologies } from './helper.service';
import { type Pacs002, type NetworkMap } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import { type CMSRequest } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/CMSRequest';
import { type TADPResult } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/TADPResult';
import { type TypologyResult } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';
import { type MetaData } from '@tazama-lf/frms-coe-lib/lib/interfaces/metaData';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const handleExecute = async (rawTransaction: any): Promise<void> => {
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

    const traceParent = metaData?.traceParent ?? undefined;
    apmTransaction = apm.startTransaction('handle.execute', {
      childOf: traceParent,
    });

    const toReturn: TADPResult = {
      id: '',
      cfg: '',
      typologyResult: [],
      prcgTm: 0,
    };

    const typologies = networkMap.messages[0].typologies.filter((t) => t.id === typologyResult.id && t.cfg === typologyResult.cfg);

    loggerService.debug(`Processing Typology ${typologyResult.cfg}.`, functionName, transactionID);
    const { typologyResult: typologyResults, review } = await handleTypologies(transaction, networkMap, typologyResult);

    if (typologyResults.length && typologyResults.length === networkMap.messages[0].typologies.length) {
      toReturn.id = networkMap.messages[0].id;
      toReturn.cfg = networkMap.messages[0].cfg;
      toReturn.typologyResult = typologyResults;
      toReturn.prcgTm = CalculateDuration(startTime);

      const alert = new Alert();
      alert.tadpResult = toReturn;
      alert.status = review ? 'ALRT' : 'NALT';
      alert.metaData = metaData;

      const spanInsertTransactionHistory = apm.startSpan('db.insert.transactionHistory');
      await databaseManager.insertTransaction(transactionID, transaction, networkMap, alert);
      spanInsertTransactionHistory?.end();
      if (!configuration.SUPPRESS_ALERTS) {
        const result: CMSRequest = {
          message: `Successfully completed ${typologies.length} typologies`,
          report: alert,
          transaction,
          networkMap,
        };

        result.report.tadpResult.prcgTm = CalculateDuration(startTime);
        await server.handleResponse(result);
      }

      loggerService.log(`Transaction completed with a status of ${alert.status}`, functionName, transactionID);
    }
    apmTransaction?.end();
  } catch (e) {
    loggerService.error('Error while calculating Transaction score', e as Error, functionName);
  } finally {
    apmTransaction?.end();
  }
};
