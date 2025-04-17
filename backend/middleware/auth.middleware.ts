import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY =
  process.env.JWT_SECRET || process.env.SECRET_KEY || "your_secret_key";

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any; // Add user property for backward compatibility
    }
  }
}

// Export the extended request interface for imports in other files
export interface ExtendedRequest extends Request {
  userId?: string;
  user?: any;
}

/**
 * Authentication middleware that verifies JWT token
 * and adds the userId to the request object
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  try {
    // Verify token and extract userId
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };

    // Add userId to request object (now properly typed)
    req.userId = decoded.userId;

    next();
  } catch (error) {
    // Handle invalid token error

    const errorMessage =
      error instanceof Error
        ? `Unauthorized: ${error.message}`
        : "Unauthorized: Invalid token";

    res.status(401).json({ error: errorMessage });
  }
};
