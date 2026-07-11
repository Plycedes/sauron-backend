import { Router } from 'express';
import { validate } from '../../middlewares';
import { CompanyAdminSchema } from '../../validators/admin/company.admin.validator';
import * as companyAdminController from '../../controllers/admin/company.admin.controller';

const router = Router();

router.get('/', validate(CompanyAdminSchema.listCompanies), companyAdminController.listCompanies);
router.get('/:companyId', companyAdminController.getCompanyById);
router.delete('/:companyId', companyAdminController.deleteCompany);

export default router;
