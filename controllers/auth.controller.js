import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const saltRounds = 12;

function createToken(user) {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return jwt.sign(
    { sub: user._id.toString() },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

export async function register(req, res) {
  const { name, email, password } = req.body ?? {};

  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already exists
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email is already registered",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  return res.status(201).json({
    message: "Registration successful",
    token: createToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  return res.json({
    message: "Login successful",
    token: createToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}