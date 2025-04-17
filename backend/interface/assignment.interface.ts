import { Document, Types } from "mongoose";

export interface IAssignment extends Document {
  id: string;
  userId: { type: Types.ObjectId; ref: "User" };
  title: string;
  course: string;
  courseId: string;
  description: string;
  dueDate: string;
  questions?: {
    question: string;
    options?: string[];
    answer?: string;
  }[];
  status: "not_started" | "in_progress" | "completed" | "late";
  priority: "high" | "medium" | "low";
  type: "quiz" | "essay" | "report" | "project";
  instructions: string;
  resources: {
    name: string;
    type: string;
    url: string;
  }[];
  submissionType: "file" | "text";
  maxScore: number;
  weight: string;
  instructor: { type: Types.ObjectId; ref: "User" };
  createdAt: string;
  updatedAt: string;
  submission: null | {
    id: string;
    url: string;
    score: number;
    feedback: string;
  };
}
