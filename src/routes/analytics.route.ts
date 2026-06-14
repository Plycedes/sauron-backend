import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { analyticsController } from "../controllers";
import { AnalyticsSchema } from "../validators";

const router = Router();

router.get("/project/:projectId", authenticate, validate(AnalyticsSchema.projectStats), analyticsController.projectStats);
router.get("/user/:userId", authenticate, validate(AnalyticsSchema.userStats), analyticsController.userStats);
router.get("/project/:projectId/confidence-trend", authenticate, validate(AnalyticsSchema.confidenceTrend), analyticsController.confidenceTrend);
router.get("/project/:projectId/stale-members", authenticate, validate(AnalyticsSchema.staleMembers), analyticsController.staleMembers);

export default router;
