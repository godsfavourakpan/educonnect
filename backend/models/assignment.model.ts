import mongoose, { Schema } from "mongoose";
import { IAssignment } from "../interface";

const AssignmentSchema: Schema = new Schema<IAssignment>(
  {
    id: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    course: { type: String, required: true },
    courseId: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: String, required: true },
    status: { type: String, required: true, default: "not_started" },
    priority: { type: String, required: true },
    questions: [
      {
        id: { type: mongoose.Types.ObjectId, ref: "Question" },
      },
    ],
    type: { type: String, required: true },
    instructions: { type: String, required: true },
    resources: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    submissionType: { type: String, required: true },
    maxScore: { type: Number, required: true },
    weight: { type: String, required: true },
    instructor: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    submission: { type: Object, default: null },
  },
  { timestamps: true }
);

const Assignment = mongoose.model<IAssignment>("Assignment", AssignmentSchema);

export default Assignment;
