"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const study_material_controller_1 = require("../controllers/study-material.controller");
const router = express_1.default.Router();
// Public routes
router.get("/", study_material_controller_1.getStudyMaterials);
router.get("/:id", study_material_controller_1.getStudyMaterialById);
router.post("/:id/download", study_material_controller_1.incrementDownloads);
// Protected routes
router.post("/", auth_middleware_1.authMiddleware, study_material_controller_1.uploadStudyMaterial);
router.put("/:id", auth_middleware_1.authMiddleware, study_material_controller_1.updateStudyMaterial);
router.delete("/:id", auth_middleware_1.authMiddleware, study_material_controller_1.deleteStudyMaterial);
exports.default = router;
