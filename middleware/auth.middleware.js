import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) {
    return next(new Error("JWT_SECRET is required"));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
