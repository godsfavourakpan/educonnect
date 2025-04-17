import mongoose, { Schema } from "mongoose";
import { ICourse, ILesson, IModule, IResource } from "../interface";

// Create Resource Schema
const ResourceSchema = new Schema<IResource>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String },
  url: { type: String },
});

// Create Lesson Schema
const LessonSchema = new Schema<ILesson>({
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
const ModuleSchema = new Schema<IModule>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  lessons: [LessonSchema],
});

// Create Course Schema
const CourseSchema: Schema = new Schema<ICourse>(
  {
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
  },
  { timestamps: true }
);

const Course = mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
