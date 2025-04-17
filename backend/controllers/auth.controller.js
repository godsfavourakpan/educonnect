"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.signIn = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const handler_1 = require("../utils/handler");
// Secret keys (store in environment variables)
const ACCESS_TOKEN_SECRET = (_a = process.env.SECRET_KEY) !== null && _a !== void 0 ? _a : "SECRET_KEY";
// Function to generate tokens
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, ACCESS_TOKEN_SECRET, {
        expiresIn: "2h",
    }); // Short expiry for security
    return accessToken;
};
// Register user
exports.register = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Registration request received");
    console.log("Request body:", req.body);
    console.log("Role value:", req.body.role);
    const { name, email, password, role } = req.body;
    const existingUser = yield user_model_1.default.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
    }
    try {
        const user = yield user_model_1.default.create({ name, email, password, role });
        console.log("Created user:", user);
        return res.status(201).json({
            message: "User registered successfully!",
        });
    }
    catch (error) {
        console.error("User creation error:", error);
        throw error;
    }
}));
// Sign in user
exports.signIn = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_model_1.default.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    console.log("hi");
    const isPasswordValid = yield user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
    }
    // Generate tokens
    const accessToken = generateTokens(user.id);
    return res
        .status(200)
        .json({ message: "Login successful", accessToken, user });
}));
// Get current user
exports.getCurrentUser = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Fetch the user from the database using userId
    const user = yield user_model_1.default.findById(req.userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
}));
