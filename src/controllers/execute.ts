import { Context, Next } from 'koa';
import { handleChannels } from '../services/logic.service';
import { LoggerService } from '../helpers';
import { ChannelResult } from '../classes/channel-result';
import { IPain001Message } from '../interfaces/iPain001';
import { NetworkMap } from '../classes/network-map';
import { RuleResult } from '../classes/rule-result';
import { TypologyResult } from '../classes/typology-result';
import { TADPResult } from '../classes/tadp-result';
import axios from 'axios';
import { Alert } from '../classes/alert';
import { configuration } from '../config';
import { cacheClient, databaseClient } from '..';
import { CMSRequest } from '../classes/cms-request';

/**
 * Handle the incoming request and return the result
 * @param ctx default koa context
 * @param next default koa next
 * @returns Koa context
 */
export const handleExecute = async (ctx: Context, next: Next): Promise<Context> => {
  try {
    // Get the request body and parse it to variables
    const transaction = ctx.request.body.transaction;
    const networkMap = ctx.request.body.networkMap as NetworkMap;
    const channelResult = ctx.request.body.channelResult as ChannelResult;

    // Send every channel request to the service function
    const toReturn: TADPResult = { id: '', cfg: '', channelResult: [] };

    const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

    if (message) {
      toReturn.id = message.id;
      toReturn.cfg = message.cfg;
      let review = false;
      const channelResults = await handleChannels(message, transaction, networkMap, channelResult);

      if (channelResults.some((c) => c.status === 'Review')) review = true;
      toReturn.channelResult = channelResults;

      const alert = new Alert();
      alert.tadpResult = toReturn;
      alert.status = review === true ? 'ALRT' : 'NALT';

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
        await executePost(configuration.cmsEndpoint, result);
      }

      ctx.body = result;
    } else {
      const tadpResult = {
        message: 'Invalid message type',
        result: [],
        networkMap: networkMap,
      };
      LoggerService.log('Invalid message type');
      ctx.body = tadpResult;
    }

    ctx.status = 200;
    await next();
    return ctx;
  } catch (e) {
    LoggerService.error('Error while calculating Transaction score', e as Error);
    ctx.status = 500;
    ctx.body = e;
  }
  return ctx;
};

const executePost = async (endpoint: string, request: CMSRequest): Promise<void | Error> => {
  try {
    const res = await axios.post(endpoint, request);
    LoggerService.log(`CMS response statusCode: ${res.status}`);
    if (res.status !== 200) {
      LoggerService.trace(`Result from CMS StatusCode != 200, request:\r\n${request}`);
      LoggerService.error(`Error Code (${res.status}) from CMS with message: \r\n${res.data ?? '[NO MESSAGE]'}`);
    } else LoggerService.log(`Success response from CMS with message: ${res.toString()}`);
  } catch (err) {
    LoggerService.error('Error while sending request to CMS', err);
    LoggerService.trace(`Error while sending request to CMS with Request:\r\n${request}`);
  }
};
