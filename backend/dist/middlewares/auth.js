"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../config/jwt");
const errors_1 = require("../utils/errors");
function authMiddleware(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errors_1.AppError("Token nao informado", 401);
        }
        const [scheme, token] = authHeader.split(" ");
        if (scheme?.toLowerCase() !== "bearer" || !token) {
            throw new errors_1.AppError("Token invalido", 401);
        }
        const payload = jsonwebtoken_1.default.verify(token, jwt_1.jwtConfig.secret);
        const userId = payload.sub ?? payload.userId ?? payload.id;
        if (!userId) {
            throw new errors_1.AppError("Token invalido", 401);
        }
        req.user = { id: userId };
        req.userId = userId;
        next();
    }
    catch (error) {
        next(error);
    }
}
