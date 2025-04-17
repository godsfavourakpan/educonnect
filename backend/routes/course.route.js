"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courses_controller_1 = require("../controllers/courses.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes
router.get("/", courses_controller_1.getAllCourses);
// Protected routes - require authentication
router.post("/", auth_middleware_1.authMiddleware, (req, res, next) => (0, courses_controller_1.createCourse)(req, res, next));
// Get instructor's courses - must be before /:courseId to avoid being treated as a courseId
router.get("/instructor/:id", auth_middleware_1.authMiddleware, (req, res, next) => (0, courses_controller_1.getInstructorCourses)(req, res, next));
// Course details route
router.get("/:courseId", courses_controller_1.getCourseById);
// Course enrollment and lesson routes
router.post("/:courseId/enroll", auth_middleware_1.authMiddleware, (req, res, next) => (0, courses_controller_1.enrollCourse)(req, res, next));
router.get("/:courseId/lessons/:lessonId", auth_middleware_1.authMiddleware, (req, res, next) => (0, courses_controller_1.getLessonContent)(req, res, next));
router.post("/:courseId/lessons/:lessonId/complete", auth_middleware_1.authMiddleware, (req, res, next) => (0, courses_controller_1.markLessonComplete)(req, res, next));
// Resource download route
router.get("/:courseId/resources/:resourceId", auth_middleware_1.authMiddleware, (req, res, next) => (0, courses_controller_1.getResource)(req, res, next));
exports.default = router;
