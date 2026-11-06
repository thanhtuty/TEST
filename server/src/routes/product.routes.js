import { Router } from "express"
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js"
const router = Router();

router.route("/")
  .get(getProducts)
  .post(createProduct);

router.route("/:id")
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

export default router;