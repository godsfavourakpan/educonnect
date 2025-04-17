import { Document, Types } from "mongoose";

export interface ICertificate extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  title: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId: string;
  grade: string;
  score: number;
  skills: string[];
  issuer: string;
  status: "issued" | "revoked";
}
