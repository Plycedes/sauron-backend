import { Router } from 'express';
import { validate } from '../../middlewares';
import { UserAdminSchema } from '../../validators/admin/user.admin.validator';
import * as userAdminController from '../../controllers/admin/user.admin.controller';

const router = Router();

router.get('/', validate(UserAdminSchema.listUsers), userAdminController.listUsers);
router.get('/:userId', userAdminController.getUserById);
router.patch(
  '/:userId/status',
  validate(UserAdminSchema.updateStatus),
  userAdminController.updateUserStatus,
);
router.patch(
  '/:userId/role',
  validate(UserAdminSchema.updateRole),
  userAdminController.updateUserRole,
);
router.delete('/:userId', userAdminController.deleteUser);

export default router;
