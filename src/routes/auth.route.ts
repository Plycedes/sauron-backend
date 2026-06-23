import { Router } from "express";
import { authController } from "../controllers";
import { authenticate, validate } from "../middlewares";
import { AuthSchema } from "../validators";

const router = Router();

router.post("/register", validate(AuthSchema.register), authController.register);
router.post("/login", validate(AuthSchema.login), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getProfile);
router.post("/refresh", validate(AuthSchema.refresh), authController.refreshToken);

export default router;
