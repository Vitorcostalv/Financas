"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Erro de validacao",
            errors: err.flatten()
        });
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.details ?? null
        });
    }
    console.error(err);
    return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        errors: null
    });
}
