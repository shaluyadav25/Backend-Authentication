import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRouter from "./router/auth.router.js";
import productRouter from "./router/product.router.js";
import { apiRateLimit } from "./middleware/rate-limit.middleware.js";

const app = express();
const port = process.env.PORT || 3000;
const corsOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins.includes("*") ? "*" : corsOrigins,
  }),
);
app.use(express.json());
app.use("/api", apiRateLimit);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
 
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON request body" });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large" });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

try {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
}
