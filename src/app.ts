/* eslint-disable @typescript-eslint/no-explicit-any */
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { configuration } from './config';
import { Server } from 'http';
import router from './routes';
import helmet from 'koa-helmet';
import { initializeRedis } from './clients/redis';
import { ArangoDBService } from './clients/arango';

class App extends Koa {
  public servers: Server[];
  constructor() {
    super();

    // bodyparser needs to be loaded first in order to work
    this.servers = [];
    this._configureRoutes();
  }

  async _configureRoutes(): Promise<void> {
    // Bootstrap application router
    const { redis } = configuration;

    if (redis?.connection) {
      const redisClient = initializeRedis(
        redis.db,
        redis.host,
        redis.port,
        redis.auth,
      );
      this.use((ctx, next) => {
        ctx.state.redisClient = redisClient;
        return next();
      });
    }

    const arangodb = new ArangoDBService();

    if (arangodb) {
      this.use(async (ctx, next) => {
        ctx.state.arangodb = arangodb;
        return next();
      });
    }

    this.use((ctx, next) => {
      ctx.state.configuration = configuration;
      return next();
    });
    this.use(bodyParser());
    this.use(router.routes());
    this.use(router.allowedMethods());
    this.use(helmet());
  }

  listen(...args: any[]): Server {
    const server = super.listen(...args);
    this.servers.push(server);
    return server;
  }

  terminate(): void {
    for (const server of this.servers) {
      server.close();
    }
  }
}

export default App;
