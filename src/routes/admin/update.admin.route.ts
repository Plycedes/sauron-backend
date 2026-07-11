import { Router } from 'express';
import { validate } from '../../middlewares';
import { UpdateAdminSchema } from '../../validators/admin/update.admin.validator';
import * as updateAdminController from '../../controllers/admin/update.admin.controller';

const router = Router();

router.get('/', validate(UpdateAdminSchema.listUpdates), updateAdminController.listUpdates);
router.get('/:updateId', updateAdminController.getUpdateById);
router.delete('/:updateId', updateAdminController.deleteUpdate);

export default router;
