import mongoose, { Schema } from "mongoose";
import { IStudyMaterial } from "../interface/study-material.interface";

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["study_guide", "past_question"],
      required: true,
    },
    subject: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    downloads: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

const StudyMaterial = mongoose.model<IStudyMaterial>(
  "StudyMaterial",
  StudyMaterialSchema
);

export default StudyMaterial;
