"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const certificate_controller_1 = require("../controllers/certificate.controller");
const router = (0, express_1.Router)();
// Generate a certificate
router.post("/generate", auth_middleware_1.authMiddleware, (req, res, next) => (0, certificate_controller_1.generateCertificate)(req, res, next));
// Get all certificates for the logged-in user
router.get("/", auth_middleware_1.authMiddleware, (req, res, next) => (0, certificate_controller_1.getUserCertificates)(req, res, next));
// Get a specific certificate
router.get("/:id", auth_middleware_1.authMiddleware, (req, res, next) => (0, certificate_controller_1.getCertificateById)(req, res, next));
exports.default = router;
