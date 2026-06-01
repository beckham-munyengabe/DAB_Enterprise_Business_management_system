import { Router } from "express";
import * as ctrl from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, ctrl.list);
router.get("/:id", protect, ctrl.getOne);
router.get("/:id/history", protect, ctrl.history);
router.post("/", protect, ctrl.create);
router.put("/:id", protect, ctrl.update);
router.delete("/:id", protect, ctrl.remove);

export default router;
