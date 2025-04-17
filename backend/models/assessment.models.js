"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const assessmentSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ["quiz", "exam", "assignment"],
        default: "quiz",
    },
    questions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Question" }],
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
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            answers: [
                {
                    questionId: {
                        type: mongoose_1.Schema.Types.ObjectId,
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
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual for calculating average score
assessmentSchema.virtual("averageScore").get(function () {
    const submissions = this.submissions || [];
    if (submissions.length === 0)
        return 0;
    const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
    return totalScore / submissions.length;
});
exports.default = (0, mongoose_1.model)("Assessment", assessmentSchema);
