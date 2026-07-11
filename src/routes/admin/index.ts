import { Router } from 'express';
import { sendResponse } from '../../utils';
import dashboardRouter from './dashboard.admin.route';
import userRouter from './user.admin.route';
import companyRouter from './company.admin.route';
import projectRouter from './project.admin.route';

const router = Router();

router.get('/health', (_req, res) => {
  sendResponse(res, 200, null, 'Admin router is active');
});

router.use('/dashboard', dashboardRouter);
router.use('/users', userRouter);
router.use('/companies', companyRouter);
router.use('/projects', projectRouter);

export default router;
