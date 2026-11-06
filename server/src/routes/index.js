import { Router } from "express";
import productRoutes from "./product.routes.js";
import orderRoutes from "./order.routes.js";
const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "MODENA Fashion API is running",
  });
});

router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
export default router;
