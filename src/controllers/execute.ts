import { Context, Next } from 'koa';
import { handleChannels } from '../services/logic.service';
import { LoggerService } from '../helpers';
import { ChannelResult } from '../classes/channel-result';
import { IPain001Message } from '../interfaces/iPain001';
import { NetworkMap } from '../classes/network-map';
import { RuleResult } from '../classes/rule-result';
import { TypologyResult } from '../classes/typology-result';

/**
 * Handle the incoming request and return the result
 * @param ctx default koa context
 * @param next default koa next
 * @returns Koa context
 */
export const handleExecute = async (ctx: Context, next: Next): Promise<Context> => {
  try {
    // Get the request body and parse it to variables
    const transaction = ctx.request.body.transaction as IPain001Message;
    const networkMap = ctx.request.body.networkMap as NetworkMap;
    const channelResult = ctx.request.body.channelResult as ChannelResult;

    const transactionId = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId;

    // Send every channel request to the service function
    let channelCounter = 0;
    const toReturn = [];

    const pain001Message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

    if (pain001Message) {
      for (const channel of pain001Message.channels) {
        channelCounter++;

        const channelRes = await handleChannels(transaction, networkMap, channelResult, channel);

        toReturn.push({ Channel: channel.id, Result: channelRes });
      }

      const result = {
        transactionId: transactionId,
        message: `Successfully completed ${channelCounter} channels`,
        result: toReturn,
        networkMap,
      };
      ctx.body = result;
    } else {
      const result = {
        transactionId: transactionId,
        message: 'Invalid message type',
        result: [],
        networkMap,
      };
      LoggerService.log('Invalid message type');
      ctx.body = result;
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
