import { Context, Next } from 'koa';
import { handleChannels } from './app.service';
import { LoggerService } from './helpers';
import { ChannelResult } from './interfaces/channel-result';
import { CustomerCreditTransferInitiation } from './interfaces/iPain001Transaction';
import { NetworkMap } from './interfaces/network-map';
import { RuleResult } from './interfaces/rule-result';
import { TypologyResult } from './interfaces/typology-result';

/**
 * Handle the incoming request and return the result
 * @param ctx default koa context
 * @param next default koa next
 * @returns Koa context
 */
export const handleExecute = async (ctx: Context, next: Next): Promise<Context> => {
  try {
    // Get the request body and parse it to variables
    const transaction = ctx.request.body.transaction as CustomerCreditTransferInitiation;
    const networkMap = ctx.request.body.networkMap as NetworkMap;
    const ruleResult = ctx.request.body.ruleResults as RuleResult[];
    const typologyResult = ctx.request.body.typologyResult as TypologyResult;
    const channelResult = ctx.request.body.channelResult as ChannelResult;

    const transactionId = transaction.PaymentInformation.CreditTransferTransactionInformation.PaymentIdentification.EndToEndIdentification;

    // Send every channel request to the service function
    let channelCounter = 0;
    const toReturn = [];
    for (const channel of networkMap.transactions[0].channels) {
      channelCounter++;

      const channelRes = await handleChannels(ctx, transaction, networkMap, ruleResult, typologyResult, channelResult, channel);

      toReturn.push(`{"Channel": ${channel.channel_id}, "Result":{${channelRes}}}`);
    }

    const result = {
      transactionId: transactionId,
      message: `Successfully ${channelCounter} channels completed`,
      result: toReturn,
    };

    ctx.body = result;
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
