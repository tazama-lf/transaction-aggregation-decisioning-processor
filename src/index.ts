import { configuration } from './config';
import App from './app';
import { LoggerService } from './helpers';
import apm from 'elastic-apm-node';
import { Context } from 'vm';

/*
 * Initialize the APM Logging
 **/
if (configuration.dev === 'production') {
  apm.start({
    serviceName: configuration.apmServiceName,
    secretToken: configuration.apmSecretToken,
    serverUrl: configuration.apmURL,
  });
}

export const app = new App();

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
if (
  Object.values(require.cache).filter(async (m) => m?.children.includes(module))
) {
  const server = app.listen(3005, () => {
    LoggerService.log(
      `API server listening on PORT ${configuration.port}`,
      'execute',
    );
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
