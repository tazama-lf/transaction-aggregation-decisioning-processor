/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import apm from '../apm';
import { type Message, type NetworkMap } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { Alert } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/Alert';
import { type CMSRequest } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/CMSRequest';
import { ChannelResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/ChannelResult';
import { type TADPResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TADPResult';
import { type TransactionConfiguration } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TransactionConfiguration';
import { databaseManager, loggerService, server, serialiseMessage } from '../index';
import { type MetaData } from '../interfaces/metaData';

const calculateDuration = (startTime: bigint): number => {
  const endTime = process.hrtime.bigint();
  return Number(endTime - startTime);
};

export const handleExecute = async (rawTransaction: any): Promise<any> => {
  let apmTransaction = null;
  try {
    const startTime = process.hrtime.bigint();
    // Get the request body and parse it to variables
    const metaData = rawTransaction?.metaData as MetaData;
    const transaction = rawTransaction.transaction;
    const networkMap = rawTransaction.networkMap as NetworkMap;
    const channelResult = rawTransaction.channelResult as ChannelResult;
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

    const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

    if (message) {
      toReturn.id = message.id;
      toReturn.cfg = message.cfg;
      let review = false;
      const channelResults = await handleChannels(message, transaction, networkMap, channelResult);

      if (channelResults.some((c) => c.status === 'Review')) review = true;
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
      if (channelResults.length > 0) {
        const transactionType = 'FIToFIPmtSts';
        const transactionID = transaction[transactionType].GrpHdr.MsgId as string;
        const spanInsertTransactionHistory = apm.startSpan('db.insert.transactionHistory');
        await databaseManager.insertTransaction(transactionID, transaction, networkMap, alert);
        spanInsertTransactionHistory?.end();
        result.report.tadpResult.prcgTm = calculateDuration(startTime);
        await server.handleResponse(result);
      }
      apmTransaction?.end();
      return channelResults;
    } else {
      loggerService.log('Invalid message type');
    }
  } catch (e) {
    loggerService.error('Error while calculating Transaction score', e as Error);
  } finally {
    apmTransaction?.end();
  }
};

export const handleChannels = async (
  message: Message,
  transaction: any,
  networkMap: NetworkMap,
  channelResult: ChannelResult,
): Promise<ChannelResult[]> => {
  const span = apm.startSpan('handleChannels');

  try {
    const transactionType = 'FIToFIPmtSts';
    const transactionID = transaction[transactionType].GrpHdr.MsgId;

    const spanTransactionHistory = apm.startSpan('db.get.transactionCfg');

    if (!networkMap.messages[0]?.id || !networkMap.messages[0]?.cfg) {
      loggerService.error(`Network map is missing configured messages.`);
      throw new Error('Network map is missing configured messages.');
    }

    const transactionConfiguration = (await databaseManager.getTransactionConfig(
      networkMap.messages[0].id,
      networkMap.messages[0].cfg,
    )) as unknown[][];

    if (!transactionConfiguration?.[0]?.[0]) {
      loggerService.error(`Transaction Configuration could not be retrieved`);
      throw new Error('Transaction Configuration could not be retrieved');
    }
    spanTransactionHistory?.end();

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const cacheKey = `tadp_${transactionID}_${message.id}_${message.cfg}`;
    const spanDBMembers = apm.startSpan('db.get.members');
    const jtypologyCount = await databaseManager.addOneGetCount(cacheKey, serialiseMessage({ channelResult }));

    // check if all Channel results for this transaction is found
    if (jtypologyCount && jtypologyCount < message.channels.length) {
      span?.end();
      loggerService.log('All channels not completed.');
      return [];
    }

    const jchannelResults = await databaseManager.getMembers(cacheKey);
    spanDBMembers?.end();
    const channelResults: ChannelResult[] = [];
    if (jchannelResults && jchannelResults.length > 0) {
      for (const jchannelResult of jchannelResults) {
        const channelResult: ChannelResult = new ChannelResult();
        Object.assign(channelResult, JSON.parse(jchannelResult).channelResult);
        channelResults.push(channelResult);
      }
    }

    let review = false;

    const currentConfiguration = transactionConfiguration[0][0] as TransactionConfiguration;
    for (const configuredChannel of currentConfiguration.channels) {
      if (configuredChannel) {
        const channelRes = channelResults.find((c) => c.id === configuredChannel.id && c.cfg === configuredChannel.cfg);
        for (const typology of configuredChannel.typologies) {
          const typologyResult = channelRes?.typologyResult.find((t) => t.id === typology.id && t.cfg === typology.cfg);
          if (!typologyResult) continue;

          if (typologyResult.result >= typology.threshold) {
            review = true;
            typologyResult.review = true;
          }
          typologyResult.threshold = typology.threshold;
        }

        if (channelRes) {
          channelRes.status = review ? 'Review' : 'None';
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          loggerService.log(`Transaction: ${transactionID} has status: ${channelRes.status}`);
        }
      }
    }

    // Delete interim cache as transaction processed to fulfilment
    await databaseManager.deleteKey(cacheKey);

    span?.end();
    return channelResults;
  } catch (error) {
    span?.end();
    loggerService.error(error as string);
    throw error;
  }
};
