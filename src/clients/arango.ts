import { Database } from 'arangojs';
import { configuration } from '../config';
import { LoggerService } from '../helpers';
import { ChannelResult } from '../interfaces/channel-result';
import { CustomerCreditTransferInitiation } from '../interfaces/iPain001Transaction';
import { NetworkMap } from '../interfaces/network-map';
import { RuleResult } from '../interfaces/rule-result';
import { TypologyResult } from '../interfaces/typology-result';

export class ArangoDBService {
  client: Database;

  constructor() {
    this.client = new Database({
      url: configuration.db.url,
      databaseName: configuration.db.name,
      auth: {
        username: configuration.db.user,
        password: configuration.db.password,
      },
    });

    if (this.client.isArangoDatabase) {
      LoggerService.log('✅ ArangoDB connection is ready');
    } else {
      LoggerService.error('❌ ArangoDB connection is not ready');
      throw new Error('ArangoDB connection is not ready');
    }
  }

  async query(query: string): Promise<unknown> {
    try {
      const cycles = await this.client.query(query);

      const results = await cycles.batches.all();

      LoggerService.log(`Query result: ${JSON.stringify(results)}`);

      return results;
    } catch (error) {
      LoggerService.error('Error while executing query from arango with message:', error as Error, 'ArangoDBService');
    }
  }

  async insertTransactionHistory(
    transactionID: string,
    transaction: CustomerCreditTransferInitiation,
    networkMap: NetworkMap,
    ruleResult: RuleResult[],
    typologyResult: TypologyResult,
    channelResult: ChannelResult,
  ): Promise<unknown> {
    try {
      const transactionHistoryQuery = `
      INSERT {
        "transactionID": ${JSON.stringify(transactionID)},
        "transaction": ${JSON.stringify(transaction)},
        "networkMap": ${JSON.stringify(networkMap)},
        "ruleResult": ${JSON.stringify(ruleResult)},
        "typologyResult": ${JSON.stringify(typologyResult)},
        "channelResult": ${JSON.stringify(channelResult)}
    } INTO "${configuration.db.collectionName}"
    `;

      const results = this.client.query(transactionHistoryQuery);

      LoggerService.log(`Inserted transaction history: ${JSON.stringify(results)}`);

      return results;
    } catch (error) {
      LoggerService.error('Error while inserting transaction history from arango with message:', error as Error, 'ArangoDBService');
    }
  }
}
