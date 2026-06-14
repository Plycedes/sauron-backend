import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { ragController } from "../controllers";
import { RagSchema } from "../validators";

const router = Router();

router.post("/query", authenticate, validate(RagSchema.query), ragController.query);

export default router;
