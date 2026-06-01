import { Router } from "express";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import customerRoutes from "./customerRoutes.js";
import saleRoutes from "./saleRoutes.js";
import purchaseRoutes from "./purchaseRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import reportRoutes from "./reportRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/customers", customerRoutes);
router.use("/sales", saleRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/employees", employeeRoutes);
router.use("/reports", reportRoutes);

export default router;
