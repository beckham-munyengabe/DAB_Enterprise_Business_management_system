import { Router } from "express";
import * as ctrl from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/dashboard", protect, ctrl.dashboard);
router.get("/daily-revenue", protect, ctrl.dailyRevenue);
router.get("/monthly-revenue", protect, ctrl.monthlyRevenue);
router.get("/top-customers", protect, ctrl.topCustomers);
router.get("/stock", protect, ctrl.stockReport);

export default router;
