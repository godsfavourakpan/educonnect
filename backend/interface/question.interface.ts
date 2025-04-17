import { Document, Types } from "mongoose";

export interface IQuestion extends Document {
  id: Types.ObjectId;
  text: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  options: options[];
}

interface options {
  id: string;
  text: string;
}
