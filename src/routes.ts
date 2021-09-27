import Router from 'koa-router';
import { handleRequest } from './app.controller';
import { handleHealthCheck } from './health.controller';

const router = new Router();

router.get('/', handleHealthCheck);
router.get('/health', handleHealthCheck);
router.post('/execute', handleRequest);

export default router;
