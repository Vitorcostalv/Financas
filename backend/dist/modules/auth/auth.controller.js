"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
class AuthController {
    static async register(req, res) {
        const user = await auth_service_1.AuthService.register(req.body);
        return (0, response_1.sendResponse)(res, 201, "Usuario cadastrado", user);
    }
    static async login(req, res) {
        const result = await auth_service_1.AuthService.login(req.body);
        return (0, response_1.sendResponse)(res, 200, "Login realizado", result);
    }
}
exports.AuthController = AuthController;
