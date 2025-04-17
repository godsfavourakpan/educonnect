"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CertificateSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true },
    assessmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Assessment",
        required: true,
    },
    title: { type: String, required: true },
    issueDate: { type: Date, default: Date.now, required: true },
    expiryDate: { type: Date },
    credentialId: { type: String, required: true, unique: true },
    grade: { type: String, required: true },
    score: { type: Number, required: true },
    skills: { type: [String], default: [] },
    issuer: { type: String, default: "EduConnect", required: true },
    status: { type: String, enum: ["issued", "revoked"], default: "issued" },
}, { timestamps: true });
// Generate a unique credential ID before saving
CertificateSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isNew) {
            return next();
        }
        // Format: EC-{courseId last 4 chars}-{userId last 4 chars}-{random 4 chars}
        const courseIdStr = this.courseId.toString().slice(-4);
        const userIdStr = this.userId.toString().slice(-4);
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.credentialId = `EC-${courseIdStr}-${userIdStr}-${randomStr}`;
        next();
    });
});
const Certificate = mongoose_1.default.model("Certificate", CertificateSchema);
exports.default = Certificate;
