import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getMyCart,
  mergeMyCart,
  updateMyCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", getMyCart);
router.post("/merge", mergeMyCart);
router.put("/", updateMyCart);

export default router;
