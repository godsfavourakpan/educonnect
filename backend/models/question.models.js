"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const questionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ["multiple-choice", "multiple-select", "true-false"]
    },
    text: {
        type: String,
        required: true
    },
    options: [{
            type: String,
            required: true
        }],
    correctAnswer: {
        type: String,
        required: function () {
            return this.type !== "multiple-select";
        }
    },
    correctAnswers: [{
            type: String,
            required: function () {
                return this.type === "multiple-select";
            }
        }],
    explanation: {
        type: String
    }
}, {
    timestamps: true
});
exports.default = (0, mongoose_1.model)("Question", questionSchema);
