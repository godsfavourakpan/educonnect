import { Types } from "mongoose";

export interface IStudyMaterial {
  _id?: string;
  title: string;
  description: string;
  type: "study_guide" | "past_question";
  subject: string;
  courseId: Types.ObjectId;
  uploadedBy: Types.ObjectId; // User ID of the uploader
  fileUrl: string;
  fileName: string;
  fileSize: number;
  downloads: number;
  status: "active" | "archived";
  createdAt?: Date;
  updatedAt?: Date;
}
