import { Router } from 'express';
import { validate } from '../../middlewares';
import { InviteAdminSchema } from '../../validators/admin/invite.admin.validator';
import * as inviteAdminController from '../../controllers/admin/invite.admin.controller';

const router = Router();

router.get('/', validate(InviteAdminSchema.listInvites), inviteAdminController.listInvites);
router.delete('/:inviteId', inviteAdminController.deleteInvite);

export default router;
