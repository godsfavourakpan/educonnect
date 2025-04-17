import { Request } from "express";
import { User } from "./user"; // Import the User type

declare module "express-serve-static-core" {
  interface Request {
    user?: User; // Attach User type to Express Request
  }
}
