import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../middleware/auth.middleware";
import { handleAsync } from "../utils/handler";
import StudyMaterial from "../models/study-material.model";
import Course from "../models/course.model";

// Get all study materials
export const getStudyMaterials = handleAsync(
  async (req: ExtendedRequest, res: Response) => {
    const {
      type,
      courseId,
      subject,
      search,
      page = "1",
      limit = "10",
    } = req.query;

    const query: any = { status: "active" };
    if (type) query.type = type;
    if (courseId) query.courseId = courseId;
    if (subject) query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const total = await StudyMaterial.countDocuments(query);
    const materials = await StudyMaterial.find(query)
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
  }
);

// Upload study material
export const uploadStudyMaterial = handleAsync(
  async (req: ExtendedRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      description,
      type,
      subject,
      courseId,
      fileUrl,
      fileName,
      fileSize,
    } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const material = new StudyMaterial({
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

    await material.save();

    res.status(201).json({
      message: "Study material uploaded successfully",
      material,
    });
  }
);

// Get study material by ID
export const getStudyMaterialById = handleAsync(
  async (req: ExtendedRequest, res: Response) => {
    const { id } = req.params;

    const material = await StudyMaterial.findById(id)
      .populate("courseId", "title")
      .populate("uploadedBy", "name")
      .lean();

    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    res.status(200).json({ material });
  }
);

// Update study material
export const updateStudyMaterial = handleAsync(
  async (req: ExtendedRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const updates = req.body;

    const material = await StudyMaterial.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    // Only allow update by uploader or admin
    if (material.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(material, updates);
    await material.save();

    res.status(200).json({
      message: "Study material updated successfully",
      material,
    });
  }
);

// Delete study material
export const deleteStudyMaterial = handleAsync(
  async (req: ExtendedRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const material = await StudyMaterial.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    // Only allow deletion by uploader or admin
    if (material.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Soft delete by setting status to archived
    material.status = "archived";
    await material.save();

    res.status(200).json({
      message: "Study material deleted successfully",
    });
  }
);

// Increment download count
export const incrementDownloads = handleAsync(
  async (req: ExtendedRequest, res: Response) => {
    const { id } = req.params;

    const material = await StudyMaterial.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    res.status(200).json({ downloads: material.downloads });
  }
);
