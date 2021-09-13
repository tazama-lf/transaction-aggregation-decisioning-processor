/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database } from 'arangojs';
import { LoggerService } from '../helpers';

export class ArangoDBService {
  client: Database;

  constructor() {
    this.client = new Database({
      url: 'http://20.49.247.152:8529',
      databaseName: 'transactionHistory',
      auth: {
        username: 'root',
        password: '123456',
      },
    });

    LoggerService.log('✅ ArangoDB connection is ready');
  }

  async query(query: string): Promise<any> {
    try {
      const cycles = await this.client.query(query);

      const results = await cycles.batches.all();

      LoggerService.log(`Query result: ${JSON.stringify(results)}`);

      return results;
    } catch (error) {
      LoggerService.error(
        'Error while executing query from arango with message:',
        error as any,
        'ArangoDBService',
      );
    }
  }
}
