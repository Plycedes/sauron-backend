import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { inviteController } from "../controllers";
import { InviteSchema } from "../validators";

const router = Router();

router.get("/pending", authenticate, inviteController.getPendingInvites);
router.post("/send", authenticate, validate(InviteSchema.send), inviteController.sendInvite);
router.post("/accept", authenticate, validate(InviteSchema.accept), inviteController.acceptInvite);

export default router;
