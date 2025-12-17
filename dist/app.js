"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const cors_2 = require("./config/cors");
const json_util_1 = require("./utils/json.util");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: cors_2.handleCorsOrigin,
    credentials: true,
}));
app.use(express_1.default.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
    },
}));
app.use((err, req, _res, next) => {
    if (err instanceof SyntaxError && req.rawBody) {
        const repaired = (0, json_util_1.tryFixLooseJson)(req.rawBody);
        if (repaired) {
            try {
                req.body = JSON.parse(repaired);
                return next();
            }
            catch {
                // fall through to the default error handler
            }
        }
    }
    next(err);
});
app.use((0, cookie_parser_1.default)());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/tasks', task_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use(error_middleware_1.errorHandler);
exports.default = app;
