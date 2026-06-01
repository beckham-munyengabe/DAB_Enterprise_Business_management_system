import { Router } from "express";
import * as ctrl from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, ctrl.list);
router.get("/low-stock", protect, ctrl.lowStock);
router.get("/:id", protect, ctrl.getOne);
router.post("/", protect, authorize("admin", "store_keeper"), ctrl.create);
router.put("/:id", protect, authorize("admin", "store_keeper"), ctrl.update);
router.delete("/:id", protect, authorize("admin"), ctrl.remove);

export default router;
