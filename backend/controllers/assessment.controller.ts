import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../middleware/auth.middleware";
import { handleAsync } from "../utils/handler";
import Assessment from "../models/assessment.models";
import User from "../models/user.model";
import Question from "../models/question.models";
import Course from "../models/course.model";
import Certificate from "../models/certificate.model";
import {
  IAssessmentAnswer,
  IAssessmentSubmission,
} from "../interface/assessments.interface";
import { IQuestion } from "../models/question.models";
import mongoose from "mongoose";

export const GetAssessment = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status, category, search, page = "1", limit = "10" } = req.query;

    const query: any = { userId: req.userId };

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ];
    }

    // Ensure pagination values are valid numbers
    const pageNum = Number.isNaN(parseInt(page as string))
      ? 1
      : parseInt(page as string);
    const limitNum = Number.isNaN(parseInt(limit as string))
      ? 10
      : parseInt(limit as string);

    const total = await Assessment.countDocuments(query);
    const assessments = await Assessment.find(query)
      .sort({ createdAt: -1 }) // Sort by latest created assessments
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(); // Optimize response

    return res.status(200).json({
      assessments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

// Get assessment by id
export const GetAssessmentById = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ assessment });
  }
);

// Start assessment
export const StartAssessment = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if user has already submitted this assessment
    const hasSubmitted = assessment.submissions.some(
      (submission) => submission.userId.toString() === req.userId
    );

    if (hasSubmitted) {
      return res.status(400).json({
        message: "You have already completed this assessment",
        status: "completed",
      });
    }

    // Update the assessment's status when user starts it
    const userStatusUpdate = {
      assessmentId: assessment._id,
      userId: req.userId,
      status: "in_progress",
      startedAt: new Date(),
    };

    // You might want to store this in a separate collection for user progress
    // For simplicity we'll just return the updated status

    res.status(200).json({
      assessment,
      userStatus: "in_progress",
      message: "Assessment started successfully",
    });
  }
);

// Submit assessment
export const SubmitAssessment = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { answers, timeSpent } = req.body;
    const assessmentId = req.params.id;

    // Find assessment with populated questions
    const assessment = await Assessment.findById(assessmentId)
      .populate<{
        questions: (IQuestion & { _id: mongoose.Types.ObjectId })[];
      }>("questions")
      .populate("course")
      .exec();

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Convert answers object to array format if needed
    const answersArray = Array.isArray(answers)
      ? answers
      : Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        }));

    // Grade each answer
    const gradedAnswers: IAssessmentAnswer[] = assessment.questions.map(
      (question) => {
        const userAnswer = answersArray.find(
          (a: any) => a.questionId === question._id.toString()
        );

        if (!userAnswer) {
          return {
            questionId: question._id,
            isCorrect: false,
            selectedAnswer: null,
            selectedAnswers: [],
          };
        }

        let isCorrect = false;

        console.log("Processing answer for question type:", question.type);

        switch (question.type) {
          case "multiple-select":
            // Ensure selectedAnswers is always an array of strings
            let userSelections: string[] = [];

            // Handle different formats that might come from the client
            if (Array.isArray(userAnswer.selectedAnswers)) {
              userSelections = userAnswer.selectedAnswers
                .map((item: any) =>
                  // Flatten any nested arrays and convert to string
                  Array.isArray(item) ? item.map(String) : String(item)
                )
                .flat();
            } else if (
              userAnswer.selectedAnswers &&
              typeof userAnswer.selectedAnswers === "object"
            ) {
              // Handle object format like {0: "value1", 1: "value2"}
              userSelections = Object.values(userAnswer.selectedAnswers).map(
                String
              );
            } else if (Array.isArray(userAnswer.selectedAnswer)) {
              // Sometimes multiple selections come in selectedAnswer field
              userSelections = userAnswer.selectedAnswer.map(String);
            }

            console.log("User selections:", userSelections);
            console.log("Correct answers:", question.correctAnswers);

            // Compare arrays after normalization
            isCorrect = arraysEqual(
              (question.correctAnswers || []).map(String).sort(),
              userSelections.sort()
            );
            break;

          case "multiple-choice":
          case "true-false":
            // Handle single selection
            const normalizedAnswer = Array.isArray(userAnswer.selectedAnswer)
              ? String(userAnswer.selectedAnswer[0])
              : String(userAnswer.selectedAnswer || "");

            isCorrect =
              String(question.correctAnswer || "") === normalizedAnswer;
            break;

          default:
            isCorrect = false;
        }

        // Normalize the answer format for storage
        let finalSelectedAnswer = null;
        let finalSelectedAnswers: string[] = [];

        if (question.type === "multiple-select") {
          // For multiple-select, store an array in selectedAnswers, null in selectedAnswer
          finalSelectedAnswers = userAnswer.selectedAnswers
            ? Array.isArray(userAnswer.selectedAnswers)
              ? userAnswer.selectedAnswers.flat().map(String)
              : Object.values(userAnswer.selectedAnswers).map(String)
            : Array.isArray(userAnswer.selectedAnswer)
              ? userAnswer.selectedAnswer.map(String)
              : [];
        } else {
          // For single-select, store a string in selectedAnswer, empty array in selectedAnswers
          finalSelectedAnswer = Array.isArray(userAnswer.selectedAnswer)
            ? String(userAnswer.selectedAnswer[0] || "")
            : String(userAnswer.selectedAnswer || "");
        }

        return {
          questionId: question._id,
          isCorrect,
          selectedAnswer: finalSelectedAnswer,
          selectedAnswers: finalSelectedAnswers,
        };
      }
    );

    // Calculate score
    const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = assessment.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = score >= assessment.passingScore;

    // Create submission
    const submission: IAssessmentSubmission = {
      userId: new mongoose.Types.ObjectId(req.userId),
      answers: gradedAnswers,
      timeSpent, // in seconds
      score,
      submittedAt: new Date(),
    };

    // Update assessment
    assessment.submissions.push(submission);
    assessment.status = "completed";
    await assessment.save();

    console.log("Assessment saved with status:", assessment.status);

    // If the user passed the assessment, check if they should receive a certificate
    let certificate = null;
    if (isPassed) {
      try {
        // Get the course to extract skills for the certificate
        const courseObj = await Course.findById(assessment.course).lean();
        if (courseObj) {
          // Check if a certificate already exists
          const existingCertificate = await Certificate.findOne({
            userId: req.userId,
            courseId: courseObj._id,
            assessmentId: assessment._id,
          });

          if (!existingCertificate) {
            // Determine grade based on score
            let grade = "C";
            if (score >= 90) grade = "A";
            else if (score >= 80) grade = "B";
            else if (score >= 70) grade = "C";
            else if (score >= 60) grade = "D";
            else grade = "F";

            // Create new certificate
            certificate = new Certificate({
              userId: req.userId,
              courseId: courseObj._id,
              assessmentId: assessment._id,
              title: `${courseObj.title} Certificate`,
              issueDate: new Date(),
              // Set expiry to 3 years from now
              expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
              grade,
              score,
              // Extract skills from course or set default
              skills: courseObj.tags || [],
              issuer: "EduConnect",
              status: "issued",
            });

            await certificate.save();
            console.log("Certificate created:", certificate._id);

            // Update user's certificates array if needed
            await User.findByIdAndUpdate(req.userId, {
              $addToSet: { certificates: certificate._id },
            });
          } else {
            console.log("Certificate already exists for this assessment");
            certificate = existingCertificate;
          }
        }
      } catch (certError) {
        console.error("Error creating certificate:", certError);
        // Don't fail the assessment submission if certificate creation fails
      }
    }

    // Prepare response data
    const response = {
      message: "Assessment submitted successfully",
      assessmentId: assessment._id,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: totalQuestions - correctCount,
      percentage: score,
      isPassed,
      passingScore: assessment.passingScore,
      timeSpent,
      submittedAt: submission.submittedAt,
      certificate: certificate
        ? {
            id: certificate._id,
            title: certificate.title,
            credentialId: certificate.credentialId,
            issueDate: certificate.issueDate,
            grade: certificate.grade,
          }
        : null,
    };

    console.log("Response prepared:", response.message);
    res.status(200).json(response);
  }
);

// Get assessment results
export const GetAssessmentResults = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ assessment });
  }
);

// Create assessment
export const CreateAssessment = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const {
        title,
        description,
        type,
        questions: questionData,
        timeLimit = 60,
        dueDate,
        status,
        passingScore = 70,
        category = "General",
        courseId,
      } = req.body;

      // First, create all the questions
      const questionIds = [];

      for (const question of questionData) {
        // Transform options from {id, text} format to string array
        const options = question.options.map((opt: any) => opt.text);

        const newQuestion = new Question({
          type: question.type,
          text: question.text,
          options,
          correctAnswer: question.correctAnswer,
          correctAnswers: question.correctAnswers,
        });

        const savedQuestion = await newQuestion.save();
        questionIds.push(savedQuestion._id);
      }

      // Create the assessment with the question IDs
      const assessment = new Assessment({
        title,
        description,
        type,
        questions: questionIds,
        timeLimit,
        dueDate,
        status,
        passingScore,
        category,
        course: courseId,
      });

      console.log("Assessments", assessment);

      await assessment.save();

      console.log("Saved");

      res.status(201).json({
        message: "Assessment created successfully",
        assessment: {
          id: assessment._id,
          title: assessment.title,
          description: assessment.description,
          type: assessment.type,
          status: assessment.status,
          questionCount: questionIds.length,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// get assesment for user enrolled course
export const getAssessmentForUser = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get enrolled courses ids
    const enrolledCourses = user.enrolledCourses;

    // Find assessments for enrolled courses
    const assessments = await Assessment.find({
      course: { $in: enrolledCourses },
    }).populate("course");

    // Return empty array instead of 404 if no assessments found
    if (!assessments || assessments.length === 0) {
      return res.status(200).json({ assessment: [] });
    }

    // Transform the data to match the expected format in the frontend
    const formattedAssessments = assessments.map((item) => {
      const assessment = item.toObject();

      // Check if user has submitted this assessment
      const userSubmission = assessment.submissions?.find(
        (submission) => submission.userId.toString() === req.userId
      );

      // Set status based on user's submission
      if (userSubmission) {
        assessment.status = "completed";
        assessment.averageScore = userSubmission.score;
      } else {
        assessment.status = "not_started";
      }

      return {
        ...assessment,
        course: {
          _id: item.course?._id || "",
          title: (item.course as any)?.title || "",
        },
      };
    });

    res.status(200).json({ assessment: formattedAssessments });
  }
);

// get question by id
export const getQuestion = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    // Find the assessment to get its questions
    const assessment = await Assessment.findById(id)
      .populate("questions")
      .populate("course", "title")
      .lean();

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if user is enrolled in the course
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is enrolled in the course that this assessment belongs to
    let isEnrolled = false;

    if (Array.isArray(user.enrolledCourses)) {
      isEnrolled = user.enrolledCourses.some(
        (courseId) => courseId.toString() === assessment.course._id.toString()
      );
    }

    if (!isEnrolled) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    // Return all questions for the assessment
    res
      .status(200)
      .json({ questions: assessment.questions, course: assessment.course });
  }
);

// get results for an assessment submission
export const getAssessmentResults = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    console.log("results for", req.userId);

    try {
      // Find the assessment with populated questions and submissions
      const assessment = await Assessment.findById(id)
        .populate({
          path: "questions",
          select: "text type options correctAnswer category",
        })
        .populate("course", "title")
        .lean();

      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      console.log("assessment found");

      // Find the user's actual submission
      const userSubmission = assessment.submissions?.find(
        (submission) => submission.userId.toString() === req.userId
      );

      console.log("user submission found");

      if (!userSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Calculate actual results
      const totalQuestions = assessment.questions.length;
      const correctAnswers = userSubmission.answers.reduce(
        (count, answer) => (answer.isCorrect ? count + 1 : count),
        0
      );
      const incorrectAnswers = totalQuestions - correctAnswers;
      const percentage = (correctAnswers / totalQuestions) * 100;
      const isPassed = percentage >= assessment.passingScore;

      // Map question results with actual correct answers
      const questionResults = assessment.questions.map((question: any) => {
        const userAnswer = userSubmission.answers.find(
          (a) => a.questionId.toString() === question._id.toString()
        );

        return {
          id: question._id,
          text: question.text,
          type: question.type,
          userAnswer:
            userAnswer?.selectedAnswer || userAnswer?.selectedAnswers || [],
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer?.isCorrect || false,
          category: question.category || "general",
        };
      });

      // Calculate performance metrics
      const categoriesMap = questionResults.reduce(
        (acc, q) => {
          const category = q.category;
          if (!acc[category]) {
            acc[category] = { total: 0, correct: 0 };
          }
          acc[category].total++;
          if (q.isCorrect) acc[category].correct++;
          return acc;
        },
        {} as Record<string, { total: number; correct: number }>
      );

      const strengths: string[] = [];
      const weaknesses: string[] = [];

      Object.entries(categoriesMap).forEach(([category, stats]) => {
        const categoryScore = (stats.correct / stats.total) * 100;
        if (categoryScore >= 70) strengths.push(category);
        if (categoryScore < 50) weaknesses.push(category);
      });

      // Prepare final response
      const results = {
        assessmentId: assessment._id,
        title: assessment.title,
        courseTitle: assessment.course || "No course",
        submittedAt: userSubmission.submittedAt,
        timeSpent: userSubmission.timeSpent,
        score: correctAnswers, // Actual score based on correct answers
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        percentage,
        isPassed,
        passingScore: assessment.passingScore,
        questions: questionResults,
        performance: {
          strengths,
          weaknesses,
          recommendations: weaknesses.map(
            (w) => `Review concepts related to ${w}`
          ),
        },
      };

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error getting assessment results:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Helper function to compare arrays
function arraysEqual(a: any[], b: any[]) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return (
    a.every((item) => b.includes(item)) && b.every((item) => a.includes(item))
  );
}
