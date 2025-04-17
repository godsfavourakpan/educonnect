"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificate_controller_1 = require("../controllers/certificate.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Get all certificates for the logged in user
router.get("/", auth_middleware_1.authMiddleware, (req, res, next) => (0, certificate_controller_1.getUserCertificates)(req, res, next));
// Get certificate by ID
router.get("/:id", auth_middleware_1.authMiddleware, (req, res, next) => (0, certificate_controller_1.getCertificateById)(req, res, next));
// Public route to verify certificate by credential ID
router.get("/verify/:credentialId", (req, res, next) => (0, certificate_controller_1.verifyCertificate)(req, res, next));
exports.default = router;
