import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { validateCreateOrder } from "../middlewares/validateOrder.js";
import {
  cancelMyOrder,
  createOrder,
  getMyOrder,
  getMyOrders,
  lookupGuestOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/lookup", lookupGuestOrder);
router.get("/my", requireAuth, getMyOrders);
router.get("/my/:id", requireAuth, getMyOrder);
router.patch("/my/:id/cancel", requireAuth, cancelMyOrder);
router.post("/", optionalAuth, validateCreateOrder, createOrder);

export default router;
