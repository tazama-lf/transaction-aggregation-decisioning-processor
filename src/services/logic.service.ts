// SPDX-License-Identifier: Apache-2.0
import apm from '../apm';

import { CalculateDuration } from '@tazama-lf/frms-coe-lib/lib/helpers/calculatePrcg';
import type { MetaData } from '@tazama-lf/frms-coe-lib/lib/interfaces/metaData';
import { Alert } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/Alert';
import type { CMSRequest } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/CMSRequest';
import type { TADPRequest } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/TADPRequest';
import type { TADPResult } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/TADPResult';
import { configuration, databaseManager, loggerService, server } from '../index';
import { handleTypologies } from './helper.service';
import type { DataCache } from '@tazama-lf/frms-coe-lib/lib/interfaces';

export const handleExecute = async (req: unknown): Promise<void> => {
  const functionName = 'handleExecute()';
  let apmTransaction = null;
  const parsedReq = req as TADPRequest & { DataCache: DataCache};
  try {
    const startTime = process.hrtime.bigint();

    // Get the request body and parse it to variables
    const metaData = parsedReq.metaData as MetaData | undefined;
    const { transaction, networkMap, typologyResult } = parsedReq;
    const transactionType = 'FIToFIPmtSts';
    const transactionID = transaction[transactionType].GrpHdr.MsgId;

    const dataCache = parsedReq.DataCache;

    apmTransaction = apm.startTransaction('handle.execute', {
      childOf: typeof metaData?.traceParent === 'string' ? metaData.traceParent : undefined,
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

      const spanInsertTransaction = apm.startSpan('db.insert.transaction');
      await databaseManager.insertTransaction(transactionID, transaction, networkMap, alert, dataCache);
      spanInsertTransaction?.end();
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
