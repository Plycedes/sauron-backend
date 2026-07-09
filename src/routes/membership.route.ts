import { Router } from 'express';
import { authenticate, requireCompanyMember, validate } from '../middlewares';
import { membershipController } from '../controllers';
import { MembershipSchema } from '../validators';

const router = Router({ mergeParams: true });

router.get('/', authenticate, requireCompanyMember(), membershipController.getCompanyMembers);
router.patch(
  '/:userId',
  authenticate,
  requireCompanyMember('company_admin'),
  validate(MembershipSchema.updateRole),
  membershipController.updateMemberRole,
);
router.delete(
  '/:userId',
  authenticate,
  requireCompanyMember('company_admin'),
  membershipController.removeMember,
);

export default router;
