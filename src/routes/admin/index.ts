import { Router } from 'express';
import { sendResponse } from '../../utils';
import dashboardRouter from './dashboard.admin.route';
import userRouter from './user.admin.route';
import companyRouter from './company.admin.route';
import projectRouter from './project.admin.route';
import inviteRouter from './invite.admin.route';
import updateRouter from './update.admin.route';

const router = Router();

router.get('/health', (_req, res) => {
  sendResponse(res, 200, null, 'Admin router is active');
});

router.use('/dashboard', dashboardRouter);
router.use('/users', userRouter);
router.use('/companies', companyRouter);
router.use('/projects', projectRouter);
router.use('/invites', inviteRouter);
router.use('/updates', updateRouter);

export default router;
