"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDemoCourseProgress = exports.updateTimeSpent = exports.updateAssignmentProgress = exports.updateLessonProgress = exports.getLearningStatsController = exports.getUpcomingClassesController = exports.getRecommendedCoursesController = exports.getUpcomingAssignmentsController = exports.getEnrolledCoursesProgress = exports.getStudentDashboard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const course_model_1 = __importDefault(require("../models/course.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const assessment_models_1 = __importDefault(require("../models/assessment.models"));
const handler_1 = require("../utils/handler");
const courseProgress_model_1 = __importDefault(require("../models/courseProgress.model"));
// Get student dashboard data
exports.getStudentDashboard = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("getStudentDashboard");
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Get user data
    const user = yield user_model_1.default.findById(req.userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    // Return the enrolled courses for user
    const enrolledCourses = yield user_model_1.default.findById(req.userId).populate({
        path: "enrolledCourses",
        model: course_model_1.default,
    });
    // Get upcoming assignments
    const upcomingAssignments = yield getUpcomingAssignments(req.userId);
    // Get upcoming classes (if applicable)
    const upcomingClasses = yield getUpcomingClasses(req.userId);
    // Get recommended courses
    const recommendedCourses = yield getRecommendedCourses(req.userId);
    // Get learning stats
    const stats = yield getLearningStats(req.userId);
    res.status(200).json({
        enrolledCourses: enrolledCourses === null || enrolledCourses === void 0 ? void 0 : enrolledCourses.enrolledCourses,
        upcomingAssignments,
        upcomingClasses,
        recommendedCourses,
        stats,
    });
}));
// Get enrolled courses with progress
exports.getEnrolledCoursesProgress = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const courses = yield getEnrolledCoursesWithProgress(req.userId);
    res.status(200).json({ courses });
}));
// Get upcoming assignments
exports.getUpcomingAssignmentsController = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const assignments = yield getUpcomingAssignments(req.userId);
    res.status(200).json({ assignments });
}));
// Get recommended courses
exports.getRecommendedCoursesController = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const courses = yield getRecommendedCourses(req.userId);
    res.status(200).json({ courses });
}));
// Get upcoming classes
exports.getUpcomingClassesController = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const classes = yield getUpcomingClasses(req.userId);
    res.status(200).json({ classes });
}));
// Get learning stats
exports.getLearningStatsController = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("getLearningStatsController");
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const stats = yield getLearningStats(req.userId);
    res.status(200).json({ stats });
}));
// Update course progress when completing a lesson
exports.updateLessonProgress = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, lessonId } = req.params;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(`Updating progress for user ${userId}, course ${courseId}, lesson ${lessonId}`);
    try {
        // Find existing progress for this specific user and course
        let progress = yield courseProgress_model_1.default.findOne({
            userId: userId,
            courseId: courseId,
        });
        // If no progress record exists, create one
        if (!progress) {
            console.log(`Creating new progress record for user ${userId} and course ${courseId}`);
            progress = yield courseProgress_model_1.default.create({
                userId,
                courseId,
                completedLessons: [new mongoose_1.default.Types.ObjectId(lessonId)],
                timeSpent: 0,
                lastAccessed: new Date(),
                startDate: new Date(),
            });
        }
        else {
            // Add lesson to completed lessons if not already completed
            const lessonObjectId = new mongoose_1.default.Types.ObjectId(lessonId);
            // Check if lesson is already in completed lessons
            const alreadyCompleted = progress.completedLessons.some((id) => id.toString() === lessonObjectId.toString());
            if (!alreadyCompleted) {
                console.log(`Adding lesson ${lessonId} to completed lessons for user ${userId}`);
                progress.completedLessons.push(lessonObjectId);
                progress.lastAccessed = new Date();
                yield progress.save();
            }
            else {
                console.log(`Lesson ${lessonId} already completed by user ${userId}`);
            }
        }
        res.status(200).json({
            message: "Progress updated successfully",
            progress: {
                courseId: progress.courseId,
                completedLessonsCount: progress.completedLessons.length,
                timeSpent: progress.timeSpent,
            },
        });
    }
    catch (error) {
        console.error("Error updating lesson progress:", error);
        res.status(500).json({
            message: "Failed to update progress",
            error: error.message,
        });
    }
}));
// Update course progress when completing an assignment
exports.updateAssignmentProgress = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, assignmentId } = req.params;
    const userId = req.userId;
    let progress = yield courseProgress_model_1.default.findOne({ userId, courseId });
    // If no progress record exists, create one
    if (!progress) {
        progress = yield courseProgress_model_1.default.create({
            userId,
            courseId,
            completedAssignments: [new mongoose_1.default.Types.ObjectId(assignmentId)],
            timeSpent: 0,
        });
    }
    else {
        // Add assignment to completed assignments if not already completed
        const assignmentObjectId = new mongoose_1.default.Types.ObjectId(assignmentId);
        if (!progress.completedAssignments.some((id) => id.equals(assignmentObjectId))) {
            progress.completedAssignments.push(assignmentObjectId);
            yield progress.save();
        }
    }
    res.status(200).json({ message: "Progress updated", progress });
}));
// Update time spent on course
exports.updateTimeSpent = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const { timeSpent } = req.body; // Time spent in minutes
    const userId = req.userId;
    let progress = yield courseProgress_model_1.default.findOne({ userId, courseId });
    if (!progress) {
        progress = yield courseProgress_model_1.default.create({
            userId,
            courseId,
            timeSpent,
        });
    }
    else {
        progress.timeSpent += timeSpent;
        progress.lastAccessed = new Date();
        yield progress.save();
    }
    res.status(200).json({ message: "Time spent updated", progress });
}));
// Create demo course progress
exports.createDemoCourseProgress = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Find user's enrolled courses
    const user = yield user_model_1.default.findById(req.userId);
    if (!user || !user.enrolledCourses || user.enrolledCourses.length === 0) {
        return res.status(404).json({ message: "No enrolled courses found" });
    }
    // Get course IDs
    const enrolledCourseIds = user.enrolledCourses;
    // Get courses with lessons and assignments
    const courses = yield course_model_1.default.find({ _id: { $in: enrolledCourseIds } });
    let progressEntries = [];
    let coursesUpdated = 0;
    // Create progress entries for each course
    for (const course of courses) {
        // Check if progress already exists for this course and user
        const existingProgress = yield courseProgress_model_1.default.findOne({
            userId: req.userId,
            courseId: course._id,
        });
        // Skip courses that already have progress
        if (existingProgress && existingProgress.completedLessons.length > 0) {
            console.log(`Skipping course ${course._id} - progress already exists`);
            continue;
        }
        // Get random number of completed lessons (between 1 and total lessons)
        const lessonIds = ((_a = course.lessons) === null || _a === void 0 ? void 0 : _a.map((lesson) => new mongoose_1.default.Types.ObjectId(lesson.id))) || [];
        const totalLessons = lessonIds.length;
        const completedCount = totalLessons > 0 ? Math.floor(Math.random() * totalLessons) + 1 : 0;
        const completedLessons = lessonIds.slice(0, completedCount);
        // Calculate random time spent (between 30 and 120 minutes per lesson)
        const timeSpent = completedCount * (Math.floor(Math.random() * 90) + 30);
        if (existingProgress) {
            // Update existing progress but only if it's empty
            if (existingProgress.completedLessons.length === 0) {
                existingProgress.completedLessons = completedLessons;
                existingProgress.timeSpent = timeSpent;
                yield existingProgress.save();
                progressEntries.push(existingProgress);
                coursesUpdated++;
            }
        }
        else {
            // Create new progress
            const newProgress = yield courseProgress_model_1.default.create({
                userId: req.userId,
                courseId: course._id,
                completedLessons,
                completedAssignments: [],
                timeSpent,
                lastAccessed: new Date(),
                startDate: new Date(),
            });
            progressEntries.push(newProgress);
            coursesUpdated++;
        }
    }
    res.status(200).json({
        message: "Demo course progress created",
        count: coursesUpdated,
    });
}));
// Helper functions
function getEnrolledCoursesWithProgress(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find user to get enrolled courses
        const user = yield user_model_1.default.findById(userId);
        console.log(user);
        if (!user || !user.enrolledCourses || user.enrolledCourses.length === 0) {
            return [];
        }
        // Get enrolled course IDs
        const enrolledCourseIds = user.enrolledCourses;
        // Find courses with those IDs
        const courses = yield course_model_1.default.find({
            _id: { $in: enrolledCourseIds },
        });
        // Get course progress data specifically for this user and their enrolled courses
        const progressData = yield courseProgress_model_1.default.find({
            userId: userId, // Explicitly filter by the current user ID
            courseId: { $in: enrolledCourseIds },
        });
        // Map progress data by course ID for easy lookup
        const progressMap = new Map();
        progressData.forEach((progress) => {
            progressMap.set(progress.courseId.toString(), progress);
        });
        // Calculate real progress for each course
        return Promise.all(courses.map((course) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const courseId = course._id.toString();
            const progress = progressMap.get(courseId);
            // Calculate real progress based on completed lessons
            const totalLessons = ((_a = course.lessons) === null || _a === void 0 ? void 0 : _a.length) || 1;
            // Only count completed lessons if progress record exists for this user and course
            const completedLessons = progress ? progress.completedLessons.length : 0;
            const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
            // Find next lesson (first uncompleted lesson)
            let nextLesson = null;
            if (course.lessons && progress) {
                // Convert completed lesson IDs to strings for comparison
                const completedLessonIds = progress.completedLessons.map((id) => id.toString());
                // Find first uncompleted lesson
                const nextLessonData = course.lessons.find((lesson) => !completedLessonIds.includes(lesson.id));
                if (nextLessonData) {
                    nextLesson = {
                        id: nextLessonData.id,
                        title: nextLessonData.title,
                    };
                }
            }
            else if (course.lessons && course.lessons.length > 0) {
                // If no progress yet, suggest the first lesson
                nextLesson = {
                    id: course.lessons[0].id,
                    title: course.lessons[0].title,
                };
            }
            return {
                _id: course._id,
                title: course.title,
                description: course.description,
                category: course.category,
                level: course.level,
                price: course.price,
                duration: course.duration,
                image: course.image,
                instructor: course.instructor,
                tags: course.tags,
                lessons: course.lessons,
                progress: progressPercentage,
                completedLessons,
                totalLessons,
                nextLesson,
                timeSpent: progress ? progress.timeSpent : 0,
            };
        })));
    });
}
function getUpcomingAssignments(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get user's enrolled courses
        const user = yield user_model_1.default.findById(userId);
        if (!user || !user.enrolledCourses || user.enrolledCourses.length === 0) {
            return [];
        }
        // Get enrolled course IDs
        const enrolledCourseIds = user.enrolledCourses;
        // Find assessments for those courses with due dates in the future
        const now = new Date();
        const assessments = yield assessment_models_1.default.find({
            courseId: { $in: enrolledCourseIds },
            dueDate: { $gt: now },
        })
            .sort({ dueDate: 1 })
            .limit(5);
        // Get course info for each assessment
        const assessmentData = [];
        for (const assessment of assessments) {
            const course = yield course_model_1.default.findById(assessment.course);
            assessmentData.push({
                id: assessment._id,
                title: assessment.title,
                courseId: assessment.course,
                courseName: course ? course.title : "Unknown Course",
                dueDate: assessment.dueDate,
                status: "pending", // Could be "completed" or "overdue" based on user's submission status
            });
        }
        return assessmentData;
    });
}
function getUpcomingClasses(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // This would connect to a live class scheduling system
        // For now, return mock data
        return [
            {
                id: "class-1",
                title: "Introduction to Algebra",
                courseId: "course-123",
                courseName: "Mathematics 101",
                startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                endTime: new Date(Date.now() + 86400000 + 5400000).toISOString(), // Tomorrow + 1.5 hours
                tutor: "Dr. Smith",
            },
            {
                id: "class-2",
                title: "Advanced Programming Concepts",
                courseId: "course-456",
                courseName: "Computer Science Fundamentals",
                startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
                endTime: new Date(Date.now() + 172800000 + 5400000).toISOString(), // Day after tomorrow + 1.5 hours
                tutor: "Prof. Johnson",
            },
        ];
    });
}
function getRecommendedCourses(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get user's enrolled courses to exclude them
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return [];
        }
        // Get enrolled course IDs to exclude
        const enrolledCourseIds = (user.enrolledCourses ||
            []);
        // Find courses not enrolled in, possibly filtered by user's interests or popular courses
        const recommendedCourses = yield course_model_1.default.find({
            _id: { $nin: enrolledCourseIds },
        }).limit(3);
        return recommendedCourses;
    });
}
function getLearningStats(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Getting learning stats for user:", userId);
        // Get user's enrolled courses
        const user = yield user_model_1.default.findById(userId);
        if (!user || !user.enrolledCourses || user.enrolledCourses.length === 0) {
            console.log("No enrolled courses found for user");
            return {
                overallCompletion: 0,
                coursesEnrolled: 0,
            };
        }
        // Get enrolled course IDs
        const enrolledCourseIds = user.enrolledCourses;
        console.log("Enrolled courses:", enrolledCourseIds.length);
        // Count the number of enrolled courses
        const coursesEnrolled = enrolledCourseIds.length;
        try {
            // Get all courses to count their total lessons
            const courses = yield course_model_1.default.find({
                _id: { $in: enrolledCourseIds },
            });
            // Calculate total lessons across all enrolled courses
            let totalLessonsAcrossAllCourses = 0;
            courses.forEach((course) => {
                var _a;
                const lessonCount = ((_a = course.lessons) === null || _a === void 0 ? void 0 : _a.length) || 0;
                totalLessonsAcrossAllCourses += lessonCount;
                console.log(`Course ${course._id} has ${lessonCount} lessons`);
            });
            // Get progress data specific to this user
            const progressData = yield courseProgress_model_1.default.find({
                userId: userId,
                courseId: { $in: enrolledCourseIds },
            });
            console.log(`Found ${progressData.length} progress records for user ${userId}`);
            // Calculate total completed lessons for this specific user
            let totalLessonsCompleted = 0;
            progressData.forEach((progress) => {
                var _a;
                const completedCount = ((_a = progress.completedLessons) === null || _a === void 0 ? void 0 : _a.length) || 0;
                totalLessonsCompleted += completedCount;
                console.log(`User completed ${completedCount} lessons in course ${progress.courseId}`);
            });
            // Calculate overall completion percentage
            const overallCompletion = totalLessonsAcrossAllCourses > 0
                ? Math.round((totalLessonsCompleted / totalLessonsAcrossAllCourses) * 100)
                : 0;
            const stats = {
                overallCompletion,
                coursesEnrolled,
            };
            console.log("Calculated stats for user", userId, ":", stats);
            return stats;
        }
        catch (error) {
            console.error("Error calculating learning stats:", error);
            // Return default values in case of error
            return {
                overallCompletion: 0,
                coursesEnrolled,
            };
        }
    });
}
