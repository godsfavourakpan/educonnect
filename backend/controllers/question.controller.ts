import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../middleware/auth.middleware";
import { handleAsync } from "../utils/handler";
import Question from "../models/question.models";
import { IQuestion } from "../interface/question.interface";
import mongoose from "mongoose";

export const CreateQuestion = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { text, type, options, correctAnswer, correctAnswers, explanation } =
      req.body;

    const question = new Question({
      text,
      type,
      options,
      correctAnswer,
      correctAnswers,
      explanation,
    });

    await question.save();

    res.status(201).json({ question });
  }
);
