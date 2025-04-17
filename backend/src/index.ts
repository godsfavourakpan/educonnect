import express, { Request, Response } from "express";
import connectDB from "../config/db";
import cors from "cors";
import morgan from "morgan";
import authRoute from "../routes/auth.route";
import courseRoute from "../routes/course.route";
import assessmentsRoute from "../routes/assessments.route";
import certificateRoute from "../routes/certificates.route";
import studentRoute from "../routes/student.routes";
import studyMaterialRoute from "../routes/study-material.routes";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;

// Middleware
app.use(express.json());
app.use(morgan("dev")); // Logging middleware
// Update your CORS configuration
app.use(
  cors({
    origin: "*", // Allow any origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Default Route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Server!");
});

// make a route to check mongodb connection
app.get("/api/db", (req: Request, res: Response) => {
  res.json({
    status: mongoose.connection.readyState,
    connected: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRoute);
app.use("/api/courses", courseRoute);
app.use("/api/assessments", assessmentsRoute);
app.use("/api/certificates", certificateRoute);
app.use("/api/student", studentRoute);
app.use("/api/study-materials", studyMaterialRoute);

// Start Server
try {
  app.listen(PORT, async () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    await connectDB();
  });
} catch (error) {
  console.error("❌ Server failed to start:", error);
  process.exit(1);
}
