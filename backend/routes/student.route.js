"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const student_controller_1 = require("../controllers/student.controller");
const router = (0, express_1.Router)();
// Get student dashboard data
router.get("/dashboard", auth_middleware_1.authMiddleware, student_controller_1.getStudentDashboard);
// Get specific data endpoints
router.get("/enrolled-courses", auth_middleware_1.authMiddleware, student_controller_1.getEnrolledCoursesProgress);
router.get("/upcoming-assignments", auth_middleware_1.authMiddleware, student_controller_1.getUpcomingAssignmentsController);
router.get("/upcoming-classes", auth_middleware_1.authMiddleware, student_controller_1.getUpcomingClassesController);
router.get("/recommended-courses", auth_middleware_1.authMiddleware, student_controller_1.getRecommendedCoursesController);
// Get learning stats
router.get("/stats", auth_middleware_1.authMiddleware, student_controller_1.getLearningStatsController);
// Create demo progress data (for testing)
router.post("/demo-progress", auth_middleware_1.authMiddleware, student_controller_1.createDemoCourseProgress);
// Course progress routes
router.post("/courses/:courseId/lessons/:lessonId/progress", auth_middleware_1.authMiddleware, student_controller_1.updateLessonProgress);
router.post("/courses/:courseId/assignments/:assignmentId/progress", auth_middleware_1.authMiddleware, student_controller_1.updateAssignmentProgress);
router.post("/courses/:courseId/time-spent", auth_middleware_1.authMiddleware, student_controller_1.updateTimeSpent);
exports.default = router;
