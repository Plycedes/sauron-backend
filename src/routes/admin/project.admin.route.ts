import { Router } from 'express';
import { validate } from '../../middlewares';
import { ProjectAdminSchema } from '../../validators/admin/project.admin.validator';
import * as projectAdminController from '../../controllers/admin/project.admin.controller';

const router = Router();

router.get('/', validate(ProjectAdminSchema.listProjects), projectAdminController.listProjects);
router.get('/:projectId', projectAdminController.getProjectById);
router.patch(
  '/:projectId/status',
  validate(ProjectAdminSchema.updateStatus),
  projectAdminController.updateProjectStatus,
);
router.delete('/:projectId', projectAdminController.deleteProject);

export default router;
