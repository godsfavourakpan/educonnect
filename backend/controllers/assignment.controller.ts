import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../middleware/auth.middleware";
import Assignment from "../models/assignment.model";
import { handleAsync } from "../utils/handler";

export const GetAssignment = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const assignment = await Assignment.find({ userId: req.user.id });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ assignment });
  }
);

export const GetAssignmentById = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ assignment });
  }
);

// Submit assignment
export const SubmitAssignment = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    const { submission } = req.body;

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.submission = submission;
    await assignment.save();

    res.status(200).json({ message: "Assignment submitted successfully" });
  }
);

// get assignment submission
export const GetSubmission = handleAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ assignment });
  }
);
