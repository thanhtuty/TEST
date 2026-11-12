import { Router } from "express";
import productRoutes from "./product.routes.js";
import orderRoutes from "./order.routes.js";
import authRoutes from "./auth.routes.js";
import cartRoutes from "./cart.routes.js";
const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "MODENA Fashion API is running",
  });
});

router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
export default router;
