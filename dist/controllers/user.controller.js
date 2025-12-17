"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersHandler = listUsersHandler;
const user_service_1 = require("../services/user.service");
async function listUsersHandler(_req, res, next) {
    try {
        const users = await (0, user_service_1.listUsers)();
        res.json(users);
    }
    catch (error) {
        next(error);
    }
}
