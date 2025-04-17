import mongoose, { Schema } from "mongoose";
import { IUser } from "../interface";
import bcrypt from "bcrypt";

// Log the available roles
const VALID_ROLES = ["student", "tutor", "both"] as const;
console.log("Valid roles:", VALID_ROLES);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: {
        values: VALID_ROLES,
        message: "Role must be either 'student', 'tutor', or 'both'",
      },
      default: "student",
    },
    enrolledCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course", // Reference to Course model
      },
    ],
    certificates: [
      {
        type: Schema.Types.ObjectId,
        ref: "Certificate", // Reference to Certificate model
      },
    ],
  },
  { timestamps: true }
);

// Hash password before storing
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

// Password comparison function
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Create User Model
const User = mongoose.model<IUser>("User", UserSchema);

export default User;
