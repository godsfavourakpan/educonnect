import { Document, Types } from "mongoose";

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor" | "both"; // Updated role types
  enrolledCourses: Types.ObjectId[] | string; // Array of ObjectId references to Course model
  certificates: Types.ObjectId[]; // Array of ObjectId references to Certificate model
  comparePassword(candidatePassword: string): Promise<boolean>;
}
