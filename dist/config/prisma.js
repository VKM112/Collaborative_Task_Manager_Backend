"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const loadEnv_1 = require("./loadEnv");
(0, loadEnv_1.loadEnv)();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is required to configure Prisma');
}
const sslEnv = process.env.DATABASE_SSL;
const sslModeDisabled = /[?&]sslmode=disable/i.test(connectionString);
const isRender = Boolean(process.env.RENDER ||
    process.env.RENDER_SERVICE_ID ||
    process.env.RENDER_EXTERNAL_URL);
const sslRequested = sslModeDisabled
    ? false
    : sslEnv === 'true' || sslEnv === '1'
        ? true
        : sslEnv === 'false' || sslEnv === '0'
            ? false
            : process.env.NODE_ENV === 'production' || isRender;
const sslStrict = process.env.DATABASE_SSL_STRICT === 'true' ||
    /[?&]sslmode=verify-(full|ca)/i.test(connectionString);
const pool = new pg_1.Pool({
    connectionString,
    ssl: sslRequested ? (sslStrict ? true : { rejectUnauthorized: false }) : undefined,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
