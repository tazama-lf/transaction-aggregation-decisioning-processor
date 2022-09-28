import Router from 'koa-router';
import { handleExecute } from './controllers/execute';
import { handleHealthCheck } from './controllers/health';

const router = new Router();

router.get('/', handleHealthCheck);
router.get('/health', handleHealthCheck);
router.post('/execute', handleExecute);

export default router;
