import { Context, Next } from 'koa';
import { LoggerService } from './helpers';
import { ChannelResult } from './interfaces/channel-result';
import { CustomerCreditTransferInitiation } from './interfaces/iPain001Transaction';
import { NetworkMap } from './interfaces/network-map';
import { RuleResult } from './interfaces/rule-result';
import { TypologyResult } from './interfaces/typology-result';

export const handleRequest = async (
  ctx: Context,
  next: Next,
): Promise<Context> => {
  const transaction = ctx.request.body
    .transaction as CustomerCreditTransferInitiation;
  const networkMap = ctx.request.body.networkMap as NetworkMap;
  const ruleResult = ctx.request.body.ruleResults as RuleResult[];
  const typologyResult = ctx.request.body.typologyResult as TypologyResult;
  const channelResult = ctx.request.body.channelResult as ChannelResult;

  const transactionID =
    transaction.PaymentInformation.CreditTransferTransactionInformation
      .PaymentIdentification.EndToEndIdentification;

  const transactionHistoryQuery = `
      INSERT {
        "transactionID": ${JSON.stringify(transactionID)},
        "transaction": ${JSON.stringify(transaction)},
        "networkMap": ${JSON.stringify(networkMap)},
        "ruleResult": ${JSON.stringify(ruleResult)},
        "typologyResult": ${JSON.stringify(typologyResult)},
        "channelResult": ${JSON.stringify(channelResult)}
    } INTO "history"
    `;

  try {
    const resp = await ctx.state.arangodb.query(transactionHistoryQuery);
    LoggerService.log(
      '👀 LOGGING ~ file: app.controller.ts ~ line 41 ~ resp',
      resp,
    );

    const result = {
      transactionID: transactionID,
      message: 'The result is saved in the Transaction History Database.',
    };

    LoggerService.log(transactionID + result.message);
    ctx.body = result;
    ctx.status = 200;
    await next();
    return ctx;
  } catch (e) {
    LoggerService.error(e as string);
    ctx.status = 500;
    ctx.body = e;
  }
  return ctx;
};
