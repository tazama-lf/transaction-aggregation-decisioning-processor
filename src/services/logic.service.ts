/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import apm from 'elastic-apm-node';
import { ChannelResult } from '../classes/channel-result';
import { Message, NetworkMap } from '../classes/network-map';
import { TransactionConfiguration } from '../classes/transaction-configuration';
import { LoggerService } from '../helpers';
import { cacheClient, databaseClient, server } from '../index';
import { CMSRequest } from '../classes/cms-request';
import { Alert } from '../classes/alert';
import { TADPResult } from '../classes/tadp-result';
import { MetaData } from '../interfaces/metaData';

const calculateDuration = (startTime: bigint): number => {
  const endTime = process.hrtime.bigint();
  return Number(endTime - startTime);
};

export const handleExecute = async (rawTransaction: any): Promise<any> => {
  try {
    const startTime = process.hrtime.bigint();
    // Get the request body and parse it to variables
    const transaction = rawTransaction.transaction;
    const networkMap = rawTransaction.networkMap as NetworkMap;
    const channelResult = rawTransaction.channelResult as ChannelResult;
    const metaData = rawTransaction?.metaData as MetaData;

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
      alert.status = review === true ? 'ALRT' : 'NALT';
      alert.metaData = metaData;
      const result: CMSRequest = {
        message: `Successfully completed ${channelResults.length} channels`,
        alert: alert,
        transaction: transaction,
        networkMap: networkMap,
      };
      if (channelResults.length > 0) {
        const transactionType = Object.keys(transaction).find((k) => k !== 'TxTp') ?? '';
        const transactionID = transaction[transactionType].GrpHdr.MsgId;
        await databaseClient.insertTransactionHistory(transactionID, transaction, networkMap, alert);
        result.alert.tadpResult.prcgTm = calculateDuration(startTime);
        await server.handleResponse(result);
      }
      return channelResults;
    } else {
      LoggerService.log('Invalid message type');
    }
  } catch (e) {
    LoggerService.error('Error while calculating Transaction score', e as Error);
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
    const transactionType = Object.keys(transaction).find((k) => k !== 'TxTp') ?? '';
    const transactionID = transaction[transactionType].GrpHdr.MsgId;

    const transactionConfiguration = await databaseClient.getTransactionConfig();
    const transactionConfigMessages = transactionConfiguration[0] as TransactionConfiguration[];
    const requiredConfigMessage = transactionConfigMessages
      .find((tc) => tc.messages.find((msg) => msg.id === message!.id && msg.cfg === message!.cfg && msg.txTp === transaction.TxTp))
      ?.messages.find((msg) => msg.id === message!.id && msg.cfg === message!.cfg && msg.txTp === transaction.TxTp);

    const cacheKey = `tadp_${transactionID}_${message!.id}_${message!.cfg}`;
    const jchannelResults = await cacheClient.getJson(cacheKey);
    const channelResults: ChannelResult[] = [];
    if (jchannelResults && jchannelResults.length > 0) {
      for (const jchannelResult of jchannelResults) {
        const channelResult: ChannelResult = new ChannelResult();
        Object.assign(channelResult, JSON.parse(jchannelResult));
        channelResults.push(channelResult);
      }
    }

    if (!message!.channels.some((c) => c.id === channelResult.id && c.cfg === channelResult.cfg)) {
      LoggerService.warn('Channel not part of Message - ignoring.');
      return [];
    }

    if (channelResults.some((t) => t.id === channelResult.id && t.cfg === channelResult.cfg)) {
      LoggerService.warn('Channel already processed - ignoring.');
      return [];
    }

    channelResults.push(channelResult);
    // check if all Channel results for this transaction is found
    if (channelResults.length < message!.channels.length) {
      await cacheClient.setJson(cacheKey, JSON.stringify(channelResults));
      LoggerService.log('All channels not completed.');
      return [];
    }
    let review = false;
    if (requiredConfigMessage)
      for (const configuredChannel of requiredConfigMessage.channels) {
        // const requiredChannel = requiredConfigMessage?.channels.find((chan) => chan.id === channelResult.id && chan.cfg === channelResult.cfg);
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
        }
      }

    let reviewMessage: string;
    if (review) {
      reviewMessage = 'Review';
    } else {
      reviewMessage = 'None';
    }
    channelResult.status = reviewMessage;
    LoggerService.log(`Transaction: ${transactionID} has status: ${reviewMessage}`);

    // Delete interim cache as transaction processed to fulfilment
    await cacheClient.deleteKey(cacheKey);

    span?.end();
    return channelResults;
  } catch (error) {
    LoggerService.error(error as string);
    span?.end();
    throw error;
  }
};
