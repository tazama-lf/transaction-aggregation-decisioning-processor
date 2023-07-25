import { ArangoDBService } from './clients/arango';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Services {
  private static databaseClient: ArangoDBService;

  public static getDatabaseInstance(): ArangoDBService {
    if (!Services.databaseClient) {
      Services.databaseClient = new ArangoDBService();
    }

    return Services.databaseClient;
  }
}
