"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
const jwt_1 = require("../../config/jwt");
class AuthService {
    static async register(data) {
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new errors_1.AppError("Email ja cadastrado", 409);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword
            }
        });
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };
    }
    static async login(data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (!user) {
            throw new errors_1.AppError("Credenciais invalidas", 401);
        }
        const isValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValid) {
            throw new errors_1.AppError("Credenciais invalidas", 401);
        }
        const token = jsonwebtoken_1.default.sign({ sub: user.id }, jwt_1.jwtConfig.secret, {
            expiresIn: jwt_1.jwtConfig.expiresIn
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        };
    }
}
exports.AuthService = AuthService;
