import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { projectController } from "../controllers";
import { ProjectSchema } from "../validators";

const router = Router();

router.post("/", authenticate, validate(ProjectSchema.create), projectController.createProject);
router.get("/", authenticate, validate(ProjectSchema.getByCompany), projectController.getProjects);
router.post("/:id/members", authenticate, validate(ProjectSchema.assignMember), projectController.assignMember);
router.delete("/:id/members/:userId", authenticate, projectController.removeMember);

export default router;
