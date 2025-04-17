import { Request, Response, NextFunction } from "express";
import { ExtendedRequest } from "../middleware/auth.middleware";

// Express async handler middleware
export const handleAsync = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
      console.error("Error:", error.message || error);
      res.status(500).json({ error: error.message || "Something went wrong" });
    });
  };
};
