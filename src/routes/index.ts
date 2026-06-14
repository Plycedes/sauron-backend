import { Router } from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import companyRoutes from "./company.route";
import inviteRoutes from "./invite.route";
import projectRoutes from "./project.route";
import updateRoutes from "./update.route";
import ragRoutes from "./rag.route";
import analyticsRoutes from "./analytics.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/invites", inviteRoutes);
router.use("/projects", projectRoutes);
router.use("/updates", updateRoutes);
router.use("/query", ragRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
