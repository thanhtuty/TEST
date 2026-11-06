import { Router } from "express";
import { validateCreateOrder } from "../middlewares/validateOrder.js";
import { createOrder } from "../controllers/order.controller.js";

const router = Router();

router.post("/", validateCreateOrder, createOrder);

export default router;