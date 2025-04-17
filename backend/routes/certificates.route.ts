import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  generateCertificate,
  getUserCertificates,
  getCertificateById,
} from "../controllers/certificate.controller";

const router = Router();

// Generate a certificate
router.post(
  "/generate",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    generateCertificate(req, res, next)
);

// Get all certificates for the logged-in user
router.get(
  "/",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getUserCertificates(req, res, next)
);

// Get a specific certificate
router.get(
  "/:id",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getCertificateById(req, res, next)
);

export default router;
