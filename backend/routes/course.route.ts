import express, { Request, Response, NextFunction } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  enrollCourse,
  getLessonContent,
  markLessonComplete,
  getInstructorCourses,
  getResource,
} from "../controllers/courses.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.get("/", getAllCourses);

// Protected routes - require authentication
router.post(
  "/",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    createCourse(req, res, next)
);

// Get instructor's courses - must be before /:courseId to avoid being treated as a courseId
router.get(
  "/instructor/:id",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getInstructorCourses(req, res, next)
);

// Course details route
router.get("/:courseId", getCourseById);

// Course enrollment and lesson routes
router.post(
  "/:courseId/enroll",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    enrollCourse(req, res, next)
);

router.get(
  "/:courseId/lessons/:lessonId",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getLessonContent(req, res, next)
);

router.post(
  "/:courseId/lessons/:lessonId/complete",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    markLessonComplete(req, res, next)
);

// Resource download route
router.get(
  "/:courseId/resources/:resourceId",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    getResource(req, res, next)
);

export default router;
