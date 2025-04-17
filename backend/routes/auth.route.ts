import { Router } from "express";
import { register, signIn } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/signin", signIn);

export default router;
