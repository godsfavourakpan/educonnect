import express, { Request, Response, NextFunction } from "express";
import {
  getUserCertificates,
  getCertificateById,
  verifyCertificate,
} from "../controllers/certificate.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Get all certificates for the logged in user
router.get(
  "/",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getUserCertificates(req, res, next)
);

// Get certificate by ID
router.get(
  "/:id",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getCertificateById(req, res, next)
);

// Public route to verify certificate by credential ID
router.get(
  "/verify/:credentialId",
  (req: Request, res: Response, next: NextFunction) =>
    verifyCertificate(req, res, next)
);

export default router;
