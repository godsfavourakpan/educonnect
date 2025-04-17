import mongoose, { Schema } from "mongoose";

interface ICourseProgress {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[];
  completedAssignments: mongoose.Types.ObjectId[];
  lastAccessed: Date;
  timeSpent: number; // in minutes
  startDate: Date;
}

const CourseProgressSchema = new Schema<ICourseProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    completedAssignments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create a compound index for efficient queries
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.model<ICourseProgress>(
  "CourseProgress",
  CourseProgressSchema
);

export default CourseProgress;
