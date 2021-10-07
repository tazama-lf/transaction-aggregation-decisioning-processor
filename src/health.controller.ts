import { Context, Next } from 'koa';

const handleHealthCheck = async (ctx: Context, next: Next): Promise<void> => {
  const data = {
    status: 'UP',
  };

  ctx.body = data;
  await next();
};

export { handleHealthCheck };
