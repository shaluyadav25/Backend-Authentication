import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import {
  createProductBodySchema,
  productParamsSchema,
  updateProductBodySchema,
  validateBody,
  validateParams,
} from "../middleware/body-validation.middleware.js";

const router = Router();

router.use(authenticate);
router
  .route("/")
  .post(validateBody(createProductBodySchema), createProduct)
  .get(getProducts);
router
  .route("/:id")
  .all(validateParams(productParamsSchema))
  .get(getProduct)
  .put(validateBody(updateProductBodySchema), updateProduct)
  .patch(validateBody(updateProductBodySchema), updateProduct)
  .delete(deleteProduct);

export default router;