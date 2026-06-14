import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { updateController } from "../controllers";
import { UpdateSchema } from "../validators";

const router = Router();

router.post("/", authenticate, validate(UpdateSchema.submit), updateController.submitUpdate);
router.get("/project", authenticate, validate(UpdateSchema.getByProject), updateController.getByProject);
router.get("/user", authenticate, validate(UpdateSchema.getByUser), updateController.getByUser);

export default router;
