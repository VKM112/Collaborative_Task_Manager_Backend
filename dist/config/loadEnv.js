"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
function loadEnv() {
    const shouldLoad = process.env.NODE_ENV !== 'production' || process.env.FORCE_DOTENV === 'true';
    if (!shouldLoad) {
        return;
    }
    const envPath = path_1.default.resolve(process.cwd(), '.env');
    const { error } = dotenv_1.default.config({ path: envPath });
    if (!error) {
        return;
    }
    const nodeError = error;
    if (nodeError.code === 'ENOENT') {
        return;
    }
    throw error;
}
