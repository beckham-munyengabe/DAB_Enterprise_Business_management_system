import { Router } from "express";
import * as ctrl from "../controllers/employeeController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, authorize("admin"), ctrl.list);
router.post("/:id/roles", protect, authorize("admin"), ctrl.assignRole);
router.delete("/:id/roles", protect, authorize("admin"), ctrl.revokeRole);

export default router;
