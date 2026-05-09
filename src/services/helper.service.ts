// SPDX-License-Identifier: Apache-2.0
import apm from '../apm';

import { databaseManager, loggerService } from '..';
import { isBaseMessageTransaction, isPacs002Transaction } from '@tazama-lf/frms-coe-lib/lib/helpers/transactionTypeGuards';
import type { NetworkMap, SupportedTransactionMessage } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import type { TypologyResult } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';

export const handleTypologies = async (
  transaction: SupportedTransactionMessage,
  networkMap: NetworkMap,
  typologyResult: TypologyResult,
): Promise<{ typologyResult: TypologyResult[]; review: boolean }> => {
  let span;
  const functionName = 'handleTypologies()';
  try {
    const [{ typologies }] = networkMap.messages;
    let transactionID = '';
    if (isPacs002Transaction(transaction)) {
      transactionID = transaction.FIToFIPmtSts.GrpHdr.MsgId;
    } else if (isBaseMessageTransaction(transaction)) {
      transactionID = transaction.MsgId;
    }
    const tenantId = transaction.TenantId;
    const cacheKey = `TADP_${tenantId}_${transactionID}_TP`;

    const jtypologyCount = await databaseManager.addOneGetCount(cacheKey, { typologyResult: { ...typologyResult } });

    // Check if all typologyResults have been stored
    // Compare with configured network map's typologies
    if (!jtypologyCount || jtypologyCount < typologies.length) {
      return {
        review: false,
        typologyResult: [],
      };
    }

    // else means we have all results for Typologies, so lets evaluate result
    const jtypologyResults = await databaseManager.getMemberValues(cacheKey);
    const typologyResults: TypologyResult[] = [];
    for (const jtypologyResult of jtypologyResults) {
      const tpResult = jtypologyResult as { typologyResult: TypologyResult };
      // Filter by tenantId to ensure we only get results for this specific tenant
      if (tpResult.typologyResult.tenantId === tenantId) {
        typologyResults.push(tpResult.typologyResult);
      }
    }
    if (!typologyResults.length) {
      return {
        review: false,
        typologyResult: [],
      };
    }

    const apmTadProc = apm.startSpan('tadProc.exec');

    const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

    if (!message) {
      let innerError;
      loggerService.error(
        `Failed to process Typology ${typologyResult.id}@${typologyResult.cfg} request for tenant ${tenantId}, Message missing from networkmap.`,
        innerError,
        functionName,
        transactionID,
      );
      return {
        review: false,
        typologyResult: [],
      };
    }

    let review = false;
    for (const typology of networkMap.messages[0].typologies) {
      const typologyResult = typologyResults.find((t) => t.id === typology.id && t.cfg === typology.cfg);
      if (!typologyResult) continue;
      if (typologyResult.review) review = true;
    }

    apmTadProc?.end();

    span = apm.startSpan(`[${transactionID}] Delete Channel interim cache key`);
    await databaseManager.deleteKey(cacheKey);
    span?.end();
    return { typologyResult: typologyResults, review };
  } catch (error) {
    span?.end();
    loggerService.error(`Failed to process Typology ${typologyResult.id}@${typologyResult.cfg} request`, error, functionName);
    return {
      review: false,
      typologyResult: [],
    };
  }
};
