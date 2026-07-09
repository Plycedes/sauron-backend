import { Router } from 'express';
import { authenticate, requireCompanyMember, validate } from '../middlewares';
import { companyController } from '../controllers';
import { CompanySchema } from '../validators';
import membershipRoutes from './membership.route';

const router = Router();

router.post('/', authenticate, validate(CompanySchema.create), companyController.createCompany);
router.get('/:companyId', authenticate, requireCompanyMember(), companyController.getCompany);
router.use('/:companyId/members', membershipRoutes);

export default router;
