import { Router } from "express";
import * as ctrl from "../controllers/purchaseController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, ctrl.list);
router.get("/:id", protect, ctrl.getOne);
router.post("/", protect, authorize("admin", "store_keeper"), ctrl.create);

export default router;
