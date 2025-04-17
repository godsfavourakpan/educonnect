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
exports.GetSubmission = exports.SubmitAssignment = exports.GetAssignmentById = exports.GetAssignment = void 0;
const assignment_model_1 = __importDefault(require("../models/assignment.model"));
const handler_1 = require("../utils/handler");
exports.GetAssignment = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const assignment = yield assignment_model_1.default.find({ userId: req.user.id });
    if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json({ assignment });
}));
exports.GetAssignmentById = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const assignment = yield assignment_model_1.default.findById(id);
    if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json({ assignment });
}));
// Submit assignment
exports.SubmitAssignment = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const assignment = yield assignment_model_1.default.findById(id);
    const { submission } = req.body;
    if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
    }
    assignment.submission = submission;
    yield assignment.save();
    res.status(200).json({ message: "Assignment submitted successfully" });
}));
// get assignment submission
exports.GetSubmission = (0, handler_1.handleAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const assignment = yield assignment_model_1.default.findById(id);
    if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json({ assignment });
}));
