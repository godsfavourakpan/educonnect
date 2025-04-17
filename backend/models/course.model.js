"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Create Resource Schema
const ResourceSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: String },
    url: { type: String },
});
// Create Lesson Schema
const LessonSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String, required: true },
    type: { type: String, required: true },
    completed: { type: Boolean, default: false },
    content: {
        videoUrl: { type: String },
        description: { type: String },
    },
    resources: [ResourceSchema],
    nextLessonId: { type: String },
    prevLessonId: { type: String },
});
// Create Module Schema
const ModuleSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    lessons: [LessonSchema],
});
// Create Course Schema
const CourseSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    category: { type: String, required: true },
    level: {
        type: String,
        required: true,
        enum: ["Beginner", "Intermediate", "Advanced"],
    },
    duration: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    instructor: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        title: { type: String },
        bio: { type: String },
        avatar: { type: String },
    },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    objectives: { type: [String], default: [] },
    modules: [ModuleSchema],
    resources: [ResourceSchema],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: { type: [String], default: [] },
    nextLesson: {
        id: { type: String, default: "" },
        title: { type: String, default: "" },
    },
    lessons: [LessonSchema],
    enrolled: { type: Boolean, default: false },
}, { timestamps: true });
const Course = mongoose_1.default.model("Course", CourseSchema);
exports.default = Course;
