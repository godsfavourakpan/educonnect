import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { handleAsync } from "../utils/handler";
import { ExtendedRequest } from "../middleware/auth.middleware";

// Secret keys (store in environment variables)
const ACCESS_TOKEN_SECRET = process.env.SECRET_KEY ?? "SECRET_KEY";

// Function to generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
  }); // Short expiry for security

  return accessToken;
};

// Register user
export const register = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Registration request received");
    console.log("Request body:", req.body);
    console.log("Role value:", req.body.role);

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    try {
      const user = await User.create({ name, email, password, role });
      console.log("Created user:", user);

      return res.status(201).json({
        message: "User registered successfully!",
      });
    } catch (error) {
      console.error("User creation error:", error);
      throw error;
    }
  }
);

// Sign in user
export const signIn = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("hi");

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate tokens
    const accessToken = generateTokens(user.id);

    return res
      .status(200)
      .json({ message: "Login successful", accessToken, user });
  }
);

// Get current user
export const getCurrentUser = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch the user from the database using userId
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  }
);
