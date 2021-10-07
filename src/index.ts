import { configuration } from './config';
import App from './app';
import { LoggerService } from './helpers';
import apm from 'elastic-apm-node';
import { Context } from 'koa';
import { ArangoDBService } from './clients/arango';
import { RedisService } from './clients/redisClient';

/*
 * Initialize the APM Logging
 **/
if (configuration.env === 'production') {
  apm.start({
    serviceName: configuration.apm?.serviceName,
    secretToken: configuration.apm?.secretToken,
    serverUrl: configuration.apm?.url,
    usePathAsTransactionName: true,
    active: Boolean(configuration.apm?.active),
  });
}

/*
 * Initialize the clients and start the server
 */
export const app = new App();
export const databaseClient = new ArangoDBService();
export const cacheClient = new RedisService();

/*
 * Centralized error handling
 **/
app.on('error', handleError);

function handleError(err: Error, ctx: Context): void {
  if (ctx == null) {
    LoggerService.error(err, undefined, 'Unhandled exception occured');
  }
}

function terminate(signal: NodeJS.Signals): void {
  try {
    app.terminate();
  } finally {
    LoggerService.log('App is terminated');
    process.kill(process.pid, signal);
  }
}

/*
 * Start server
 **/
if (Object.values(require.cache).filter(async (m) => m?.children.includes(module))) {
  const server = app.listen(configuration.port, () => {
    LoggerService.log(`API server listening on PORT ${configuration.port}`, 'execute');
  });
  server.on('error', handleError);

  const errors = ['unhandledRejection', 'uncaughtException'];
  errors.forEach((error) => {
    process.on(error, handleError);
  });

  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  signals.forEach((signal) => {
    process.once(signal, () => terminate(signal));
  });
}

export default app;
