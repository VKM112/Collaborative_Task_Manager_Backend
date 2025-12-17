"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = createToken;
exports.verifyToken = verifyToken;
exports.setAuthCookie = setAuthCookie;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const signOptions = { expiresIn: JWT_EXPIRES_IN };
function createToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, signOptions);
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
const isSecureCookie = env_1.env.FRONTEND_URL.startsWith('https://');
function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: isSecureCookie ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });
}
