import { LoggerService } from '../helpers';
import { ChannelResult } from '../classes/channel-result';
import { IPain001Message } from '../interfaces/iPain001';
import { Channel, NetworkMap } from '../classes/network-map';
import { cacheClient, databaseClient } from '../index';
import apm from 'elastic-apm-node';
import { TransactionConfiguration } from '../classes/transaction-configuration';

export const handleChannels = async (
  transaction: IPain001Message,
  networkMap: NetworkMap,
  channelResult: ChannelResult,
  channel: Channel,
): Promise<{
  transactionID: string;
  message: string;
}> => {
  try {
    apm.setTransactionName('TADProc');
    const span = apm.startSpan('handleChannels');
    const transactionID = transaction.CstmrCdtTrfInitn.GrpHdr.MsgId;
    const transactionConfiguration = await databaseClient.getTransactionConfig();
    const transactionConfigMessages = transactionConfiguration[0][0] as TransactionConfiguration;
    const requiredConfigMessage = transactionConfigMessages.messages.find((msg) => msg.txTp === transaction.TxTp);

    const requiredChannel = requiredConfigMessage?.channels.find((chan) => chan.id === channelResult.id && chan.cfg === channelResult.cfg);

    const requiredTypology = requiredChannel?.typologies.find(
      (typology) => typology.id === channelResult.typologyResult[0].id && typology.cfg === channelResult.typologyResult[0].cfg,
    );

    // Initialize the result message
    const result = {
      transactionID: transactionID,
      message: '',
      status: '',
    };

    if (requiredChannel && requiredTypology) {
      let message: string;
      if (channelResult.typologyResult[0].result >= requiredTypology.threshold) {
        message = 'Review';
      } else {
        message = 'None';
      }
      result.status = message;
      LoggerService.log(`Transaction: ${transactionID} has status: ${message}`);
    }

    // Check if the channel is completed
    const hasChannelCompleted = await checkChannelCompletion(transactionID, channel, channelResult, networkMap);

    // If the channel is completed, then save the transaction evaluation result
    if (hasChannelCompleted) {
      // Save the transaction evaluation result
      await databaseClient.insertTransactionHistory(transactionID, transaction, networkMap, channelResult);

      result.message = 'The transaction evaluation result is saved.';
    } else {
      result.message = 'The transaction evaluation result is not saved.';
    }

    span?.end();
    return result;
  } catch (error) {
    LoggerService.error(error as string);
    throw error;
  }
};

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
    typologyResult: channelResult.typologyResult,
  });

  // Second check: if all results for this Channel is found
  if (cacheResults.length < networkMap.messages[0].channels.length) {
    LoggerService.log(`[${transactionID}] Save Channel interim rule results to Cache`);

    cacheClient.setJson(cacheKey, JSON.stringify(cacheResults));

    return false;
  }
  // The channel is completed
  cacheClient.deleteKey(cacheKey);
  return true;
};
