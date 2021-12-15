/* eslint-disable */
import { Database } from 'arangojs';
import { configuration } from '../config';
import { LoggerService } from '../helpers';
import { ChannelResult } from '../classes/channel-result';
import { IPain001Message } from '../interfaces/iPain001';
import { NetworkMap } from '../classes/network-map';

export class ArangoDBService {
  client: Database;
  transactionConfig: Database;

  constructor() {
    this.client = new Database({
      url: configuration.db.url,
      databaseName: configuration.db.name,
      auth: {
        username: configuration.db.user,
        password: configuration.db.password,
      },
    });

    this.transactionConfig = new Database({
      url: configuration.db.url,
      databaseName: configuration.db.transactionConfigDb,
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

    if (this.transactionConfig.isArangoDatabase) {
      LoggerService.log('✅ ArangoDB connection to transactionConfig is ready');
    } else {
      LoggerService.error('❌ ArangoDB connection to transactionConfig is not ready');
      throw new Error('ArangoDB connection to transactionConfig is not ready');
    }
  }

  async query(query: string, client: Database): Promise<unknown> {
    try {
      const cycles = await client.query(query);
      const results = await cycles.batches.all();

      // LoggerService.log(`Query result: ${JSON.stringify(results)}`);

      return results;
    } catch (error) {
      LoggerService.error('Error while executing query from arango with message:', error as Error, 'ArangoDBService');
    }
  }

  async getTransactionConfig(): Promise<any> {
    const transactionInfoQuery = `
      FOR doc IN ${configuration.db.transactionConfigCollection}
        RETURN UNSET(doc, "_id", "_key", "_rev")
    `;
    return this.query(transactionInfoQuery, this.transactionConfig);
  }

  async insertTransactionHistory(
    transactionID: string,
    transaction: IPain001Message,
    networkMap: NetworkMap,
    channelResult: ChannelResult,
  ): Promise<unknown> {
    try {
      const transactionHistoryQuery = `
      INSERT {
        "transactionID": ${JSON.stringify(transactionID)},
        "transaction": ${JSON.stringify(transaction)},
        "networkMap": ${JSON.stringify(networkMap)},
        "channelResult": ${JSON.stringify(channelResult)}
    } INTO ${configuration.db.collectionName}
    `;
      const results = await this.query(transactionHistoryQuery, this.client);

      LoggerService.log(`Inserted transaction history: ${JSON.stringify(results)}`);

      return results;
    } catch (error) {
      LoggerService.error('Error while inserting transaction history from arango with message:', error as Error, 'ArangoDBService');
    }
  }
}
