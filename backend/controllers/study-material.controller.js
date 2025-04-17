"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementDownloads = exports.deleteStudyMaterial = exports.updateStudyMaterial = exports.getStudyMaterialById = exports.uploadStudyMaterial = exports.getStudyMaterials = void 0;
const handler_1 = require("../utils/handler");
const study_material_model_1 = __importDefault(require("../models/study-material.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
// Get all study materials
exports.getStudyMaterials = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, courseId, subject, search, page = "1", limit = "10", } = req.query;
    const query = { status: "active" };
    if (type)
        query.type = type;
    if (courseId)
        query.courseId = courseId;
    if (subject)
        query.subject = subject;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = yield study_material_model_1.default.countDocuments(query);
    const materials = yield study_material_model_1.default.find(query)
        .populate("courseId", "title")
        .populate("uploadedBy", "name")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();
    res.status(200).json({
        materials,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
        },
    });
}));
// Upload study material
exports.uploadStudyMaterial = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { title, description, type, subject, courseId, fileUrl, fileName, fileSize, } = req.body;
    // Verify course exists
    const course = yield course_model_1.default.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const material = new study_material_model_1.default({
        title,
        description,
        type,
        subject,
        courseId,
        uploadedBy: req.userId,
        fileUrl,
        fileName,
        fileSize,
    });
    yield material.save();
    res.status(201).json({
        message: "Study material uploaded successfully",
        material,
    });
}));
// Get study material by ID
exports.getStudyMaterialById = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const material = yield study_material_model_1.default.findById(id)
        .populate("courseId", "title")
        .populate("uploadedBy", "name")
        .lean();
    if (!material) {
        return res.status(404).json({ message: "Study material not found" });
    }
    res.status(200).json({ material });
}));
// Update study material
exports.updateStudyMaterial = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const updates = req.body;
    const material = yield study_material_model_1.default.findById(id);
    if (!material) {
        return res.status(404).json({ message: "Study material not found" });
    }
    // Only allow update by uploader or admin
    if (material.uploadedBy.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
    }
    Object.assign(material, updates);
    yield material.save();
    res.status(200).json({
        message: "Study material updated successfully",
        material,
    });
}));
// Delete study material
exports.deleteStudyMaterial = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const material = yield study_material_model_1.default.findById(id);
    if (!material) {
        return res.status(404).json({ message: "Study material not found" });
    }
    // Only allow deletion by uploader or admin
    if (material.uploadedBy.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
    }
    // Soft delete by setting status to archived
    material.status = "archived";
    yield material.save();
    res.status(200).json({
        message: "Study material deleted successfully",
    });
}));
// Increment download count
exports.incrementDownloads = (0, handler_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const material = yield study_material_model_1.default.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true });
    if (!material) {
        return res.status(404).json({ message: "Study material not found" });
    }
    res.status(200).json({ downloads: material.downloads });
}));
