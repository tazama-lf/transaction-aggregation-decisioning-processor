// SPDX-License-Identifier: Apache-2.0
import apm from '../apm';

import { CalculateDuration } from '@tazama-lf/frms-coe-lib/lib/helpers/calculatePrcg';
import type { DataCache } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import type { Alert } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/Alert';
import type { CMSRequest } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/CMSRequest';
import type { TADPRequest } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/TADPRequest';
import type { TADPResult } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/TADPResult';
import { v7 } from 'uuid';
import { configuration, databaseManager, loggerService, server } from '../index';
import { handleTypologies } from './helper.service';

export const handleExecute = async (req: unknown): Promise<void> => {
  const functionName = 'handleExecute()';
  let apmTransaction = null;
  const parsedReq = req as TADPRequest & { DataCache: DataCache };
  try {
    const startTime = process.hrtime.bigint();

    // Get the request body and parse it to variables
    const { metaData } = parsedReq;
    const { transaction, networkMap, typologyResult } = parsedReq;
    const [networkMapMessage] = networkMap.messages;
    const transactionType = 'FIToFIPmtSts';
    const transactionID = transaction[transactionType].GrpHdr.MsgId;
    const dataCache = parsedReq.DataCache;
    const tenantId = parsedReq.transaction.TenantId;

    // Pre-calculate alert subject to avoid repeated string concatenation in hot path
    const alertSubject =
      configuration.ALERT_DESTINATION === 'tenant' ? [`${configuration.ALERT_PRODUCER}-${tenantId}`] : [configuration.ALERT_PRODUCER];

    apmTransaction = apm.startTransaction('handle.execute', {
      childOf: typeof metaData?.traceParent === 'string' ? metaData.traceParent : undefined,
    });

    const tadpResult: TADPResult = {
      id: '',
      cfg: '',
      typologyResult: [],
      prcgTm: 0,
    };

    const typologyCount = networkMap.messages[0].typologies.length;

    loggerService.debug(`Processing Typology ${typologyResult.cfg} for tenant ${tenantId}.`, functionName, transactionID);
    const { typologyResult: typologyResults, review } = await handleTypologies(transaction, networkMap, typologyResult);

    if (typologyResults.length && typologyResults.length === typologyCount) {
      tadpResult.id = networkMapMessage.id;
      tadpResult.cfg = networkMapMessage.cfg;
      tadpResult.typologyResult = typologyResults;
      tadpResult.prcgTm = CalculateDuration(startTime);

      const alert: Alert = {
        evaluationID: v7(),
        tadpResult,
        status: review ? 'ALRT' : 'NALT',
        metaData,
        timestamp: new Date().toISOString(),
      };

      const spanInsertTransaction = apm.startSpan('db.insert.transaction');
      await databaseManager.saveEvaluationResult(transactionID, transaction, networkMap, alert, dataCache);
      spanInsertTransaction?.end();
      if (!configuration.SUPPRESS_ALERTS) {
        const result: CMSRequest = {
          message: `Successfully completed ${typologyCount} typologies`,
          report: alert,
          transaction,
          networkMap,
        };

        result.report.tadpResult.prcgTm = CalculateDuration(startTime);

        await server.handleResponse(result, alertSubject);
      }

      loggerService.log(`Transaction completed with a status of ${alert.status} for tenant ${tenantId}`, functionName, transactionID);
    }
    apmTransaction?.end();
  } catch (e) {
    loggerService.error('Error while calculating Transaction score', e as Error, functionName);
  } finally {
    apmTransaction?.end();
  }
};
