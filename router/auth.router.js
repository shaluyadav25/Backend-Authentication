import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { authRateLimit } from "../middleware/rate-limit.middleware.js";
import {
  loginBodySchema,
  registerBodySchema,
  validateBody,
} from "../middleware/body-validation.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimit,
  validateBody(registerBodySchema),
  register,
);
router.post("/login", authRateLimit, validateBody(loginBodySchema), login);

export default router;
