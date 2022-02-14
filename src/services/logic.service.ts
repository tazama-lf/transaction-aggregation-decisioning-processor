/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService } from '../helpers';
import { ChannelResult } from '../classes/channel-result';
import { IPain001Message } from '../interfaces/iPain001';
import { Channel, Message, NetworkMap } from '../classes/network-map';
import { cacheClient, databaseClient } from '../index';
import apm from 'elastic-apm-node';
import { TransactionConfiguration } from '../classes/transaction-configuration';
import { kebabCase } from 'lodash';

export const checkChannelCompletion = async (
  transactionID: string,
  channel: Channel,
  channelResult: ChannelResult,
  networkMap: NetworkMap,
): Promise<boolean> => {
  const cacheKey = `${transactionID}_${channel.id}_${channel.cfg}`;

  const cacheData = await cacheClient.getJson(cacheKey);

  const cacheResults: ChannelResult[] = cacheData ? [...JSON.parse(cacheData)] : [];

  // First check: The channel is not completed
  if (cacheResults.some((c) => c.id === channelResult.id && c.cfg === channelResult.cfg)) {
    return false;
  }

  cacheResults.push({
    id: channelResult.id,
    result: channelResult.result,
    cfg: channelResult.cfg,
    status: channelResult.status,
    typologyResult: channelResult.typologyResult,
  });

  // Second check: if all channel results for this Message is found
  if (cacheResults.length < networkMap.messages[0].channels.length) {
    LoggerService.log(`[${transactionID}] Save interim channel results to Cache`);

    cacheClient.setJson(cacheKey, JSON.stringify(cacheResults));

    return false;
  }

  // The channel is completed
  cacheClient.deleteKey(cacheKey);
  return true;
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
      .find((tc) => tc.messages.find((msg) => msg.id === message.id && msg.cfg === message.cfg && msg.txTp === transaction.TxTp))
      ?.messages.find((msg) => msg.id === message.id && msg.cfg === message.cfg && msg.txTp === transaction.TxTp);

    const cacheKey = `tadp_${transactionID}_${message.id}_${message.cfg}`;
    const jchannelResults = await cacheClient.getJson(cacheKey);
    const channelResults: ChannelResult[] = [];
    if (jchannelResults && jchannelResults.length > 0) Object.assign(channelResults, JSON.parse(jchannelResults));

    if (!message.channels.some((c) => c.id === channelResult.id && c.cfg === channelResult.cfg)) {
      LoggerService.warn('Channel not part of Message - ignoring.');
      return [];
    }

    if (channelResults.some((t) => t.id === channelResult.id && t.cfg === channelResult.cfg)) {
      LoggerService.warn('Channel already processed - ignoring.');
      return [];
    }

    channelResults.push(channelResult);
    // check if all Channel results for this transaction is found
    if (channelResults.length < message.channels.length) {
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
            const tpres = {};
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

    // Save the transaction evaluation result
    cacheClient.deleteKey(cacheKey);

    span?.end();
    return channelResults;
  } catch (error) {
    LoggerService.error(error as string);
    span?.end();
    throw error;
  }
};
