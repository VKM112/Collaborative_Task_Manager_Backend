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
    const hashed = await (0, password_util_1.hashPassword)(data.password);
    const existing = await prisma_1.default.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new errors_1.ApiError(409, 'Email already registered');
    }
    return prisma_1.default.user.create({
        data: {
            ...data,
            password: hashed,
            provider: 'local',
        },
    });
}
async function loginUser(email, password) {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        return null;
    const match = await (0, password_util_1.comparePassword)(password, user.password);
    return match ? user : null;
}
async function loginWithGoogle(idToken) {
    const profile = await verifyGoogleToken(idToken);
    const hashed = await (0, password_util_1.hashPassword)(crypto_1.default.randomBytes(32).toString('hex'));
    return prisma_1.default.user.upsert({
        where: { email: profile.email },
        update: {
            name: profile.name,
            avatar: profile.avatar,
            googleId: profile.googleId,
            provider: 'google',
        },
        create: {
            name: profile.name,
            email: profile.email,
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
