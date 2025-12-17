"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.loginWithGoogle = loginWithGoogle;
exports.getUserById = getUserById;
const crypto_1 = __importDefault(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const prisma_1 = __importDefault(require("../config/prisma"));
const password_util_1 = require("../utils/password.util");
const errors_1 = require("../types/errors");
const email_util_1 = require("../utils/email.util");
async function verifyGoogleToken(idToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw new Error('Missing Google client ID');
    }
    const client = new google_auth_library_1.OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
        throw new Error('Failed to verify Google token');
    }
    return {
        email: payload.email,
        name: payload.name ?? payload.email.split('@')[0],
        avatar: payload.picture ?? null,
        googleId: payload.sub,
    };
}
async function registerUser(data) {
    const normalizedEmail = (0, email_util_1.normalizeEmail)(data.email);
    const hashed = await (0, password_util_1.hashPassword)(data.password);
    const existing = await prisma_1.default.user.findFirst({ where: { email: normalizedEmail } });
    if (existing) {
        throw new errors_1.ApiError(409, 'Email already registered');
    }
    return prisma_1.default.user.create({
        data: {
            ...data,
            email: normalizedEmail,
            provider: 'local',
            password: hashed,
        },
    });
}
async function loginUser(email, password) {
    const normalizedEmail = (0, email_util_1.normalizeEmail)(email);
    const user = await prisma_1.default.user.findFirst({ where: { email: normalizedEmail } });
    if (!user)
        return null;
    const match = await (0, password_util_1.comparePassword)(password, user.password);
    return match ? user : null;
}
async function loginWithGoogle(idToken) {
    const profile = await verifyGoogleToken(idToken);
    const normalizedEmail = (0, email_util_1.normalizeEmail)(profile.email);
    const hashed = await (0, password_util_1.hashPassword)(crypto_1.default.randomBytes(32).toString('hex'));
    return prisma_1.default.user.upsert({
        where: { email: normalizedEmail },
        update: {
            name: profile.name,
            avatar: profile.avatar,
            googleId: profile.googleId,
            provider: 'google',
        },
        create: {
            name: profile.name,
            email: normalizedEmail,
            password: hashed,
            avatar: profile.avatar,
            googleId: profile.googleId,
            provider: 'google',
        },
    });
}
async function getUserById(id) {
    return prisma_1.default.user.findUnique({ where: { id } });
}
