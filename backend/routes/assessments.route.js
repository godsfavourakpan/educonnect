"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assessment_controller_1 = require("../controllers/assessment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes
router.get("/", assessment_controller_1.GetAssessment);
// User-specific assessments route - must come before /:id to avoid being treated as an ID parameter
router.get("/user", auth_middleware_1.authMiddleware, (req, res, next) => (0, assessment_controller_1.getAssessmentForUser)(req, res, next));
// Assessment by ID route
router.get("/:id", assessment_controller_1.GetAssessmentById);
// Get results for an assessment
router.get("/:id/results", auth_middleware_1.authMiddleware, assessment_controller_1.getAssessmentResults);
// Protected routes - require authentication
router.post("/:id/start", auth_middleware_1.authMiddleware, (req, res, next) => (0, assessment_controller_1.StartAssessment)(req, res, next));
router.post("/:id/submit", auth_middleware_1.authMiddleware, (req, res, next) => (0, assessment_controller_1.SubmitAssessment)(req, res, next));
router.post("/create", auth_middleware_1.authMiddleware, (req, res, next) => (0, assessment_controller_1.CreateAssessment)(req, res, next));
router.get("/:id/question", auth_middleware_1.authMiddleware, (req, res, next) => (0, assessment_controller_1.getQuestion)(req, res, next));
exports.default = router;
