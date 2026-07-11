import { Router } from 'express';
import * as dashboardAdminController from '../../controllers/admin/dashboard.admin.controller';

const router = Router();

router.get('/', dashboardAdminController.getStats);

export default router;
