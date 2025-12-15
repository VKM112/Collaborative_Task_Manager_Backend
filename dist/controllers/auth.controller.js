"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = registerHandler;
exports.loginHandler = loginHandler;
exports.googleLoginHandler = googleLoginHandler;
exports.profileHandler = profileHandler;
exports.logoutHandler = logoutHandler;
const auth_service_1 = require("../services/auth.service");
const jwt_util_1 = require("../utils/jwt.util");
const handleAuthSuccess = (res, user) => {
    const token = (0, jwt_util_1.createToken)({ userId: user.id });
    (0, jwt_util_1.setAuthCookie)(res, token);
    return res.json({ user });
};
async function registerHandler(req, res, next) {
    try {
        const user = await (0, auth_service_1.registerUser)(req.body);
        return handleAuthSuccess(res, user);
    }
    catch (error) {
        next(error);
    }
}
async function loginHandler(req, res, next) {
    try {
        const user = await (0, auth_service_1.loginUser)(req.body.email, req.body.password);
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        return handleAuthSuccess(res, user);
    }
    catch (error) {
        next(error);
    }
}
async function googleLoginHandler(req, res, next) {
    try {
        const user = await (0, auth_service_1.loginWithGoogle)(req.body.idToken);
        return handleAuthSuccess(res, user);
    }
    catch (error) {
        next(error);
    }
}
async function profileHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await (0, auth_service_1.getUserById)(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
}
function logoutHandler(_req, res) {
    res.clearCookie('token', { path: '/' });
    res.json({ success: true });
}
