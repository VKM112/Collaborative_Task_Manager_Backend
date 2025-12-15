"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_routes_1 = __importDefault(require("./auth.routes"));
const task_routes_1 = __importDefault(require("./task.routes"));
function registerRoutes(app) {
    app.use('/api/v1/auth', auth_routes_1.default);
    app.use('/api/v1/tasks', task_routes_1.default);
}
