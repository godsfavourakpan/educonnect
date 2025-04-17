import { Document, Types } from "mongoose";
import { IQuestion } from "./question.interface";

export interface IAssessmentAnswer {
  questionId: Types.ObjectId;
  selectedAnswer?: string | null;
  selectedAnswers?: string[];
  isCorrect: boolean;
}

export interface IAssessmentSubmission {
  userId: Types.ObjectId;
  answers: IAssessmentAnswer[];
  score: number;
  timeSpent: number;
  submittedAt: Date;
}

export interface IAssessment extends Document {
  title: string;
  course: Types.ObjectId;
  description: string;
  type: "quiz" | "exam" | "assignment";
  questions: Types.ObjectId[];
  timeLimit: number;
  dueDate: string;
  status: "not_started" | "in_progress" | "completed";
  passingScore: number;
  category: string;
  submissions: IAssessmentSubmission[];
  createdBy: Types.ObjectId;
  averageScore: number; // Virtual field
}
