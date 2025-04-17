import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getStudyMaterials,
  uploadStudyMaterial,
  getStudyMaterialById,
  updateStudyMaterial,
  deleteStudyMaterial,
  incrementDownloads,
} from "../controllers/study-material.controller";

const router = express.Router();

// Public routes
router.get("/", getStudyMaterials);
router.get("/:id", getStudyMaterialById);
router.post("/:id/download", incrementDownloads);

// Protected routes
router.post("/", authMiddleware, uploadStudyMaterial);
router.put("/:id", authMiddleware, updateStudyMaterial);
router.delete("/:id", authMiddleware, deleteStudyMaterial);

export default router;
