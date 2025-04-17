import { Schema, model } from "mongoose";
import {
  IAssessment,
  IAssessmentSubmission,
} from "../interface/assessments.interface";

const assessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["quiz", "exam", "assignment"],
      default: "quiz",
    },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    timeLimit: { type: Number, required: true }, // in minutes
    dueDate: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    passingScore: { type: Number, required: true },
    category: { type: String, required: true },
    submissions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        answers: [
          {
            questionId: {
              type: Schema.Types.ObjectId,
              ref: "Question",
              required: true,
            },
            selectedAnswer: { type: String },
            selectedAnswers: [{ type: String }],
            isCorrect: { type: Boolean, required: true },
          },
        ],
        score: { type: Number, required: true },
        timeSpent: { type: Number, required: true }, // in minutes
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calculating average score
assessmentSchema.virtual("averageScore").get(function (this: IAssessment) {
  const submissions = this.submissions || [];
  if (submissions.length === 0) return 0;

  const totalScore = submissions.reduce(
    (sum: number, sub: IAssessmentSubmission) => sum + sub.score,
    0
  );
  return totalScore / submissions.length;
});

export default model<IAssessment>("Assessment", assessmentSchema);
