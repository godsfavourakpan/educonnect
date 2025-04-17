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
exports.getResource = exports.markLessonComplete = exports.getLessonContent = exports.enrollCourse = exports.getCourseById = exports.getInstructorCourses = exports.getAllCourses = exports.createCourse = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const courseProgress_model_1 = __importDefault(require("../models/courseProgress.model"));
// Create a course
const createCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Get the complete user data from database
        const userId = req.userId;
        const instructor = yield user_model_1.default.findById(userId);
        if (!instructor) {
            res.status(404).json({ message: "Instructor not found" });
            return;
        }
        const { title, description, longDescription, category, level, lessons, duration, price, image, tags, requirements, objectives, modules, resources, } = req.body;
        if (!title ||
            !description ||
            !category ||
            !level ||
            !duration ||
            !price ||
            !modules) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const newCourse = yield course_model_1.default.create({
            title,
            description,
            longDescription,
            category,
            level,
            duration,
            price,
            image: image || "/placeholder.svg?height=400&width=800", // Default image if not provided
            tags: tags || [],
            requirements: requirements || [],
            objectives: objectives || [],
            modules: modules || [],
            resources: resources || [],
            instructor: {
                id: instructor._id,
                name: instructor.name,
                avatar: "/placeholder.svg?height=100&width=100", // Default avatar
            },
            rating: 0,
            reviews: 0,
            students: 0,
            featured: false,
            progress: 0,
            completedLessons: [],
            nextLesson: lessons && lessons.length > 0
                ? { id: lessons[0].id, title: lessons[0].title }
                : { id: "", title: "" },
            lessons: lessons || [],
            enrolled: false,
        });
        console.log("Course created:", newCourse);
        res.status(201).json({ message: "Course Created", course: newCourse });
    }
    catch (error) {
        console.error("Error creating course:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to create course" });
    }
});
exports.createCourse = createCourse;
// Get all courses
const getAllCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield course_model_1.default.find({});
        res.status(200).json({ courses });
    }
    catch (error) {
        console.error("Error fetching courses:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch courses" });
    }
});
exports.getAllCourses = getAllCourses;
// Get course for instructor
const getInstructorCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const courses = yield course_model_1.default.find({ "instructor.id": id });
        res.status(200).json({ courses });
    }
    catch (error) {
        console.error("Error fetching courses:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch courses" });
    }
});
exports.getInstructorCourses = getInstructorCourses;
// Get course by ID
const getCourseById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: "Invalid course ID" });
            return;
        }
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        res.status(200).json({ course });
    }
    catch (error) {
        console.error("Error fetching course:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch course" });
    }
});
exports.getCourseById = getCourseById;
// Enroll in a course
const enrollCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { courseId } = req.params;
        const userId = req.userId;
        // Check if course exists
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        // Find user and update enrolled courses
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if already enrolled
        const courseObjectId = new mongoose_1.default.Types.ObjectId(courseId);
        const enrolledCourses = user.enrolledCourses;
        if (enrolledCourses.some((id) => id.equals(courseObjectId))) {
            res.status(400).json({ message: "Already enrolled in this course" });
            return;
        }
        // Update user's enrolled courses
        enrolledCourses.push(courseObjectId);
        yield user.save();
        // Update course's student count
        course.students += 1;
        course.enrolled = true;
        yield course.save();
        console.log("Enrolled in course:", course);
        // Make sure no progress record exists yet (this prevents phantom progress)
        const existingProgress = yield courseProgress_model_1.default.findOne({
            userId,
            courseId: courseObjectId,
        });
        // Only create a fresh progress record if it doesn't exist
        if (!existingProgress) {
            // Initialize empty progress record with zero completion
            yield courseProgress_model_1.default.create({
                userId,
                courseId: courseObjectId,
                completedLessons: [], // Start with no completed lessons
                completedAssignments: [],
                timeSpent: 0,
                lastAccessed: new Date(),
                startDate: new Date(),
            });
            console.log(`Created blank progress record for user ${userId} in course ${courseId}`);
        }
        // Return updated user information without sensitive data
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            enrolledCourses: user.enrolledCourses,
        };
        res.status(200).json({
            message: "Successfully enrolled in course",
            user: userResponse,
        });
    }
    catch (error) {
        console.error("Error enrolling in course:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to enroll in course" });
    }
});
exports.enrollCourse = enrollCourse;
// Get lesson content
const getLessonContent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { courseId, lessonId } = req.params;
        const userId = req.userId;
        // Check if course exists
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        // Find user
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if user is enrolled in the course
        const courseObjectId = new mongoose_1.default.Types.ObjectId(courseId);
        const enrolledCourses = user.enrolledCourses;
        if (!enrolledCourses.some((id) => id.equals(courseObjectId))) {
            res.status(403).json({ message: "Not enrolled in this course" });
            return;
        }
        // Find the lesson
        const lesson = course.lessons.find((l) => l.id === lessonId);
        if (!lesson) {
            res.status(404).json({ message: "Lesson not found" });
            return;
        }
        res.status(200).json({ lesson });
    }
    catch (error) {
        console.error("Error fetching lesson:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch lesson" });
    }
});
exports.getLessonContent = getLessonContent;
// Mark lesson as completed
const markLessonComplete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        console.log("Marking lesson complete - course:", req.params.courseId, "lesson:", req.params.lessonId);
        const { courseId, lessonId } = req.params;
        const userId = req.userId;
        // Check if course exists
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        console.log("found the course", course);
        // Find user
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if user is enrolled in the course
        const courseObjectId = new mongoose_1.default.Types.ObjectId(courseId);
        const enrolledCourses = user.enrolledCourses;
        if (!enrolledCourses.some((id) => id.equals(courseObjectId))) {
            res.status(403).json({ message: "Not enrolled in this course" });
            return;
        }
        console.log("user enrolled courses", enrolledCourses);
        // Find the module and lesson
        let lessonFound = false;
        let moduleIndex = -1;
        let lessonIndex = -1;
        // Check if modules exist and log the course structure
        if (!course.modules || course.modules.length === 0) {
            console.log("No modules found for this course:", course);
            res.status(404).json({ message: "No modules found for this course" });
            return;
        }
        // Log the full course structure to understand what we're working with
        console.log("Course structure:", JSON.stringify({
            id: course._id,
            title: course.title,
            modules: course.modules.map((m) => {
                var _a, _b;
                return ({
                    id: m.id,
                    title: m.title,
                    lessonsCount: ((_a = m.lessons) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    lessonIds: ((_b = m.lessons) === null || _b === void 0 ? void 0 : _b.map((l) => l.id)) || [],
                });
            }),
        }, null, 2));
        // Look through all modules to find the lesson
        let foundModule = null;
        let foundLesson = null;
        for (let i = 0; i < course.modules.length; i++) {
            const module = course.modules[i];
            console.log(`Searching in module ${i}: ${module.title}`);
            if (!module.lessons) {
                console.log(`  Module has no lessons array`);
                continue;
            }
            for (let j = 0; j < module.lessons.length; j++) {
                const lesson = module.lessons[j];
                console.log(`  Checking lesson ${j}: ${lesson.id} vs ${lessonId}`);
                if (lesson.id === lessonId) {
                    moduleIndex = i;
                    lessonIndex = j;
                    foundModule = module;
                    foundLesson = lesson;
                    lessonFound = true;
                    console.log(`  Found! Module: ${i}, Lesson: ${j}, Title: ${lesson.title}`);
                    break;
                }
            }
            if (lessonFound)
                break;
        }
        // Update lesson directly using the found reference
        if (!lessonFound || !foundLesson) {
            console.log("Lesson not found in any module");
            res.status(404).json({ message: "Lesson not found" });
            return;
        }
        console.log("Found lesson:", {
            moduleIndex,
            lessonIndex,
            lessonId: foundLesson.id,
            lessonTitle: foundLesson.title,
        });
        // Mark lesson as completed and save the changes
        try {
            // First, mark the specific lesson as completed in the nested structure
            console.log("Before update - Lesson completed status:", foundLesson.completed);
            // Set completed to true directly on the found lesson object
            foundLesson.completed = true;
            console.log("After update - Lesson completed status:", foundLesson.completed);
            // Ensure completedLessons array exists
            if (!course.completedLessons) {
                course.completedLessons = [];
            }
            // Add to completedLessons array if not already there
            if (!course.completedLessons.includes(lessonId)) {
                course.completedLessons.push(lessonId);
                console.log(`Added lessonId ${lessonId} to completedLessons array`);
            }
            else {
                console.log(`LessonId ${lessonId} already in completedLessons array`);
            }
            // Calculate course progress
            const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
            course.progress = (course.completedLessons.length / totalLessons) * 100;
            console.log(`Course progress updated: ${course.progress.toFixed(2)}%`);
            // Determine the next lesson
            if (moduleIndex !== undefined && lessonIndex !== undefined) {
                // Check if there's another lesson in the current module
                if (lessonIndex < course.modules[moduleIndex].lessons.length - 1) {
                    const nextLesson = course.modules[moduleIndex].lessons[lessonIndex + 1];
                    course.nextLesson = {
                        id: nextLesson.id,
                        title: nextLesson.title,
                    };
                    console.log(`Next lesson set to: ${nextLesson.title} in same module`);
                }
                // Check if there's another module with lessons
                else if (moduleIndex < course.modules.length - 1) {
                    const nextModule = course.modules[moduleIndex + 1];
                    if (nextModule.lessons.length > 0) {
                        const nextLesson = nextModule.lessons[0];
                        course.nextLesson = {
                            id: nextLesson.id,
                            title: nextLesson.title,
                        };
                        console.log(`Next lesson set to: ${nextLesson.title} in next module`);
                    }
                    else {
                        course.nextLesson = {
                            id: "",
                            title: "",
                        };
                        console.log("No next lesson available");
                    }
                }
                else {
                    course.nextLesson = {
                        id: "",
                        title: "",
                    };
                    console.log("No next lesson available - end of course");
                }
            }
            // Mark nested fields as modified for Mongoose
            course.markModified("modules");
            course.markModified("completedLessons");
            course.markModified("progress");
            course.markModified("nextLesson");
            // Save the updated course
            yield course.save();
            // Verify the lesson was marked as complete after saving
            const updatedCourse = yield course_model_1.default.findById(courseId);
            console.log("After save - Lesson completed status:", foundLesson.completed, "completedLessons array:", updatedCourse === null || updatedCourse === void 0 ? void 0 : updatedCourse.completedLessons);
            res.status(200).json({
                message: "Lesson marked as complete successfully",
                nextLesson: course.nextLesson,
                progress: course.progress,
            });
        }
        catch (error) {
            console.error("Error marking lesson as complete:", error);
            res.status(500).json({
                message: "Failed to mark lesson as complete",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    catch (error) {
        console.error("Error marking lesson complete:", error);
        res.status(500).json({
            message: error instanceof Error
                ? error.message
                : "Failed to mark lesson as complete",
        });
    }
});
exports.markLessonComplete = markLessonComplete;
// Get resource
const getResource = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { courseId, resourceId } = req.params;
        const userId = req.userId;
        console.log(`Retrieving resource: ${resourceId} from course: ${courseId} for user: ${userId}`);
        // Check if course exists
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        // Find user
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if user is enrolled in the course
        const courseObjectId = new mongoose_1.default.Types.ObjectId(courseId);
        const enrolledCourses = user.enrolledCourses;
        if (!enrolledCourses.some((id) => id.equals(courseObjectId))) {
            res.status(403).json({ message: "Not enrolled in this course" });
            return;
        }
        // Find the resource
        const resource = (_a = course.resources) === null || _a === void 0 ? void 0 : _a.find((r) => r.id === resourceId);
        if (!resource) {
            res.status(404).json({ message: "Resource not found" });
            return;
        }
        // Return resource URL
        if (!resource.url) {
            res.status(404).json({ message: "Resource URL not available" });
            return;
        }
        console.log(`Found resource: ${resource.title}, URL: ${resource.url}`);
        res.status(200).json({ url: resource.url });
    }
    catch (error) {
        console.error("Error fetching resource:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch resource" });
    }
});
exports.getResource = getResource;
