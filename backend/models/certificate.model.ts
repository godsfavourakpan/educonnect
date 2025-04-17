import mongoose, { Schema } from "mongoose";
import { ICertificate } from "../interface/certificate.interface";

const CertificateSchema: Schema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    title: { type: String, required: true },
    issueDate: { type: Date, default: Date.now, required: true },
    expiryDate: { type: Date },
    credentialId: { type: String, required: true, unique: true },
    grade: { type: String, required: true },
    score: { type: Number, required: true },
    skills: { type: [String], default: [] },
    issuer: { type: String, default: "EduConnect", required: true },
    status: { type: String, enum: ["issued", "revoked"], default: "issued" },
  },
  { timestamps: true }
);

// Generate a unique credential ID before saving
CertificateSchema.pre<ICertificate>("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  // Format: EC-{courseId last 4 chars}-{userId last 4 chars}-{random 4 chars}
  const courseIdStr = this.courseId.toString().slice(-4);
  const userIdStr = this.userId.toString().slice(-4);
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();

  this.credentialId = `EC-${courseIdStr}-${userIdStr}-${randomStr}`;
  next();
});

const Certificate = mongoose.model<ICertificate>(
  "Certificate",
  CertificateSchema
);

export default Certificate;
