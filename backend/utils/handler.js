"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAsync = void 0;
// Express async handler middleware
const handleAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error("Error:", error.message || error);
            res.status(500).json({ error: error.message || "Something went wrong" });
        });
    };
};
exports.handleAsync = handleAsync;
