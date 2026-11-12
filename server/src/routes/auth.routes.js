import { Router } from "express";
import {
  changePassword,
  createAddress,
  deleteAddress,
  getAddresses,
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  getMe,
  login,
  logout,
  register,
  updateProfile,
  updateAddress,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.post("/logout", requireAuth, logout);
router.patch("/profile", requireAuth, updateProfile);
router.patch("/password", requireAuth, changePassword);
router.get("/addresses", requireAuth, getAddresses);
router.post("/addresses", requireAuth, createAddress);
router.put("/addresses/:id", requireAuth, updateAddress);
router.delete("/addresses/:id", requireAuth, deleteAddress);
router.get("/wishlist", requireAuth, getWishlist);
router.post("/wishlist/:productId", requireAuth, addWishlistItem);
router.delete("/wishlist/:productId", requireAuth, removeWishlistItem);

export default router;
