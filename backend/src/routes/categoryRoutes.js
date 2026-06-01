import { Router } from "express";
import * as ctrl from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, ctrl.list);
router.get("/:id", protect, ctrl.getOne);
router.post("/", protect, authorize("admin"), ctrl.create);
router.put("/:id", protect, authorize("admin"), ctrl.update);
router.delete("/:id", protect, authorize("admin"), ctrl.remove);

export default router;
