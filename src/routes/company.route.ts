import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { companyController } from "../controllers";
import { CompanySchema } from "../validators";

const router = Router();

router.post("/", authenticate, validate(CompanySchema.create), companyController.createCompany);
router.get("/:id", authenticate, companyController.getCompany);

export default router;
