"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3333),
    DATABASE_URL: zod_1.z.string().default("file:./dev.db"),
    JWT_SECRET: zod_1.z.string().default("dev-secret-change-me"),
    JWT_EXPIRES_IN: zod_1.z.string().default("7d")
});
exports.env = envSchema.parse(process.env);
