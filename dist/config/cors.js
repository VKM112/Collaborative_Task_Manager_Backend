"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllowedOrigin = isAllowedOrigin;
exports.handleCorsOrigin = handleCorsOrigin;
const env_1 = require("./env");
const renderFrontendPattern = /^https:\/\/collaborative-task-manager-frontend(-[A-Za-z0-9]+)?\.onrender\.com$/;
const allowedOrigins = new Set([
    'http://localhost:5173',
    'https://taskflowmanagervkm.netlify.app',
    env_1.env.FRONTEND_URL,
].filter(Boolean));
function isAllowedOrigin(origin) {
    if (!origin) {
        return true;
    }
    if (allowedOrigins.has(origin)) {
        return true;
    }
    return renderFrontendPattern.test(origin);
}
function handleCorsOrigin(origin, callback) {
    if (isAllowedOrigin(origin)) {
        return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
}
