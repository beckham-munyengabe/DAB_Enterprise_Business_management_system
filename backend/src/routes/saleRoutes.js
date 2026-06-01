import { Router } from "express";
import * as ctrl from "../controllers/saleController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, ctrl.list);
router.get("/:id", protect, ctrl.getOne);
router.post("/", protect, authorize("admin", "sales_manager"), ctrl.create);

export default router;
