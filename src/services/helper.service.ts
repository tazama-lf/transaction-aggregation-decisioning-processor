/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Channel, type Message, type NetworkMap, type Pacs002 } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { type ChannelResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/ChannelResult';
import { type TypologyResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';
import { databaseManager, loggerService } from '..';
import { type TransactionConfiguration } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TransactionConfiguration';
import apm from '../apm';
import { type MetaData } from '../interfaces/metaData';

export const handleChannels = async (
  message: Message,
  transaction: Pacs002,
  networkMap: NetworkMap,
  channelResult: ChannelResult,
): Promise<ChannelResult[]> => {
  const span = apm.startSpan('handleChannels');

  try {
    const transactionType = 'FIToFIPmtSts';
    const transactionID = transaction[transactionType].GrpHdr.MsgId;

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const cacheKey = `tadp_${transactionID}_${message.id}_${message.cfg}`;
    const spanDBMembers = apm.startSpan('db.get.members');
    const jchannelCount = await databaseManager.addOneGetCount(cacheKey, { channelResult: { ...channelResult } });

    // check if all Channel results for this transaction is found
    if (jchannelCount && jchannelCount < message.channels.length) {
      span?.end();
      loggerService.log('All channels not completed.');
      return [];
    }

    const spanTransactionHistory = apm.startSpan('db.get.transactionCfg');
    const transactionConfiguration = (await databaseManager.getTransactionConfig(
      networkMap.messages[0].id,
      networkMap.messages[0].cfg,
    )) as unknown[][];

    if (!transactionConfiguration?.[0]?.[0]) {
      loggerService.error(`Transaction Configuration could not be retrieved`);
      throw new Error('Transaction Configuration could not be retrieved');
    }
    spanTransactionHistory?.end();

    const jchannelResults = await databaseManager.getMemberValues(cacheKey);
    spanDBMembers?.end();
    const channelResults: ChannelResult[] = jchannelResults.map((jchannelResult) => jchannelResult.channelResult as ChannelResult);

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
          channelRes.status = review ? 'ALRT' : 'NALT';
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

export const handleTypologies = async (
  transaction: Pacs002,
  channel: Channel,
  networkMap: NetworkMap,
  typologyResult: TypologyResult,
  metaData?: MetaData,
): Promise<any> => {
  let span;
  const startTime = process.hrtime.bigint();
  try {
    const transactionID = transaction.FIToFIPmtSts.GrpHdr.MsgId;
    const cacheKey = `CADP_${transactionID}_${channel.id}_${channel.cfg}`;
    const jtypologyCount = await databaseManager.addOneGetCount(cacheKey, { typologyResult: { ...typologyResult } });

    // check if all results for this Channel is found
    if (jtypologyCount && jtypologyCount < channel.typologies.length) {
      return {
        result: 'Incomplete',
        tadpReqBody: undefined,
      };
    }

    // else means we have all results for Channel, so lets evaluate result
    const jtypologyResults = await databaseManager.getMemberValues(cacheKey);
    const typologyResults: TypologyResult[] = jtypologyResults.map((jtypologyResult) => jtypologyResult.typologyResult as TypologyResult);
    if (!typologyResults || !typologyResults.length)
      return {
        result: 'Error',
        tadpReqBody: undefined,
      };

    // Keep scaffold here - this will be used in future.
    // const expressionRes = await arangoDBService.getExpression(channel.channel_id);
    // if (!expressionRes)
    //   return 0.0;

    const channelResult: ChannelResult = {
      prcgTm: calculateDuration(startTime),
      result: 0.0,
      cfg: channel.cfg,
      id: channel.id,
      typologyResult: typologyResults,
    };
    const apmTadProc = apm.startSpan('tadProc.exec');

    const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

    if (!message) {
      loggerService.error(`Failed to process Channel ${channel.id} request , Message missing from networkmap.`);
      return {
        result: 'Error',
        tadpReqBody: undefined,
      };
    }

    const channelResults = await handleChannels(message, transaction, networkMap, channelResult);
    apmTadProc?.end();

    span = apm.startSpan(`[${transactionID}] Delete Channel interim cache key`);
    await databaseManager.deleteKey(cacheKey);
    span?.end();
    return channelResults;
  } catch (error) {
    span?.end();
    loggerService.error(`Failed to process Channel ${channel.id} request`, error as Error, 'executeRequest');
    return {
      result: 'Error',
      tadpReqBody: undefined,
    };
  }
};

export const calculateDuration = (startTime: bigint): number => {
  const endTime = process.hrtime.bigint();
  return Number(endTime - startTime);
};
