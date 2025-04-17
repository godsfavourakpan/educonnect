"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY || "your_secret_key";
/**
 * Authentication middleware that verifies JWT token
 * and adds the userId to the request object
 */
const authMiddleware = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.header("Authorization");
    const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))
        ? authHeader.substring(7)
        : null;
    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }
    try {
        // Verify token and extract userId
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        // Add userId to request object (now properly typed)
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        // Handle invalid token error
        const errorMessage = error instanceof Error
            ? `Unauthorized: ${error.message}`
            : "Unauthorized: Invalid token";
        res.status(401).json({ error: errorMessage });
    }
};
exports.authMiddleware = authMiddleware;
