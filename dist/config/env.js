"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const loadEnv_1 = require("./loadEnv");
(0, loadEnv_1.loadEnv)();
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'PORT', 'GOOGLE_CLIENT_ID'];
function getEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
exports.env = {
    DATABASE_URL: getEnv('DATABASE_URL'),
    JWT_SECRET: getEnv('JWT_SECRET'),
    PORT: getEnv('PORT'),
    GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
};
