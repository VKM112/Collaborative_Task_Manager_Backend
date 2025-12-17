"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const errors_1 = require("../types/errors");
function errorHandler(err, _req, res, _next) {
    if (err instanceof errors_1.ApiError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: 'Invalid request data.',
            issues: err.issues,
        });
    }
    console.error(err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ message });
}
