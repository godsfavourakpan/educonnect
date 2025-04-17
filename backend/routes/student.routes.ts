import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getStudentDashboard,
  getEnrolledCoursesProgress,
  getUpcomingAssignmentsController,
  getRecommendedCoursesController,
  getUpcomingClassesController,
  updateLessonProgress,
  updateAssignmentProgress,
  updateTimeSpent,
  createDemoCourseProgress,
  getLearningStatsController,
} from "../controllers/student.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Student dashboard routes
router.get("/dashboard", getStudentDashboard);
router.get("/courses/enrolled", getEnrolledCoursesProgress);
router.get("/assessments/upcoming", getUpcomingAssignmentsController);
router.get("/courses/recommended", getRecommendedCoursesController);
router.get("/classes/upcoming", getUpcomingClassesController);
router.get("/stats", getLearningStatsController);
router.post("/demo-progress", createDemoCourseProgress);
router.post(
  "/courses/:courseId/lessons/:lessonId/progress",
  updateLessonProgress
);
router.post(
  "/courses/:courseId/assignments/:assignmentId/progress",
  updateAssignmentProgress
);
router.post("/courses/:courseId/time-spent", updateTimeSpent);
router.get("/courses/:courseId/lessons/:lessonId/progress", (req, res) => {
  // Placeholder for lesson progress retrieval
  res.status(200).json({ message: "Lesson progress retrieved successfully" });
});
router.get(
  "/courses/:courseId/assignments/:assignmentId/progress",
  (req, res) => {
    // Placeholder for assignment progress retrieval
    res
      .status(200)
      .json({ message: "Assignment progress retrieved successfully" });
  }
);
router.get("/courses/:courseId/time-spent", (req, res) => {
  // Placeholder for time spent retrieval
  res.status(200).json({ message: "Time spent retrieved successfully" });
});

export default router;
