import { Router } from 'express';
import { sendResponse } from '../../utils';

const router = Router();

router.get('/health', (_req, res) => {
  sendResponse(res, 200, null, 'Admin router is active');
});

export default router;
