import express, { Request, Response, NextFunction } from "express";
import {
  GetAssessment,
  GetAssessmentById,
  StartAssessment,
  SubmitAssessment,
  GetAssessmentResults,
  getAssessmentForUser,
  CreateAssessment,
  getAssessmentResults,
  getQuestion,
} from "../controllers/assessment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.get("/", GetAssessment);

// User-specific assessments route - must come before /:id to avoid being treated as an ID parameter
router.get(
  "/user",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getAssessmentForUser(req, res, next)
);

// Assessment by ID route
router.get("/:id", GetAssessmentById);

// Get results for an assessment
router.get("/:id/results", authMiddleware, getAssessmentResults);

// Protected routes - require authentication
router.post(
  "/:id/start",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    StartAssessment(req, res, next)
);
router.post(
  "/:id/submit",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    SubmitAssessment(req, res, next)
);

router.post(
  "/create",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    CreateAssessment(req, res, next)
);

router.get(
  "/:id/question",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getQuestion(req, res, next)
);

export default router;
