import { Schema, model, Document } from "mongoose";

export interface IQuestion extends Document {
  type: "multiple-choice" | "multiple-select" | "true-false";
  text: string;
  options: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string;
}

const questionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    required: true,
    enum: ["multiple-choice", "multiple-select", "true-false"]
  },
  text: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: function(this: IQuestion) {
      return this.type !== "multiple-select";
    }
  },
  correctAnswers: [{
    type: String,
    required: function(this: IQuestion) {
      return this.type === "multiple-select";
    }
  }],
  explanation: {
    type: String
  }
}, {
  timestamps: true
});

export default model<IQuestion>("Question", questionSchema);
