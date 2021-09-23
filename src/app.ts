/* eslint-disable @typescript-eslint/no-explicit-any */
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { Server } from 'http';
import router from './routes';
import helmet from 'koa-helmet';
import { RedisService } from './clients/redis';
import { ArangoDBService } from './clients/arango';
import { LoggerService } from './helpers';

class App extends Koa {
  public servers: Server[];
  constructor() {
    super();

    // bodyparser needs to be loaded first in order to work
    this.servers = [];
    this._configureRoutes();
    this._configureClients();
  }

  async _configureRoutes(): Promise<void> {
    this.use(bodyParser());
    this.use(router.routes());
    this.use(router.allowedMethods());
    this.use(helmet());
  }

  configureMiddlewares(): void {
    // LoggerService Middleware
    this.use(async (ctx, next) => {
      await next();
      const rt = ctx.response.get('X-Response-Time');
      if (ctx.path !== '/health') {
        LoggerService.log(`${ctx.method} ${ctx.url} - ${rt}`);
      }
    });

    // x-response-time
    this.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      ctx.set('X-Response-Time', `${ms}ms`);
    });
  }

  async _configureClients(): Promise<void> {
    const arangodb = new ArangoDBService();

    if (arangodb) {
      this.use(async (ctx, next) => {
        ctx.state.arangodb = arangodb;
        return next();
      });
    }

    const redisClient = new RedisService();

    if (redisClient) {
      this.use((ctx, next) => {
        ctx.state.redisClient = redisClient;
        return next();
      });
    }
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
