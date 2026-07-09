import { Router } from 'express';
import { authenticate } from '../middlewares';
import { validate } from '../middlewares';
import { userController, membershipController } from '../controllers';
import { UserSchema } from '../validators';

const router = Router();

router.get('/me/companies', authenticate, membershipController.getMyCompanies);
router.get('/:id', authenticate, userController.getUser);
router.patch('/:id', authenticate, validate(UserSchema.update), userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

export default router;
