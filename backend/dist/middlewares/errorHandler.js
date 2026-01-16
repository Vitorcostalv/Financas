"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
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
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            message: "Dados invalidos.",
            errors: null
        });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Ja existe uma categoria com esse nome.",
                errors: err.meta ?? null
            });
        }
        if (["P2000", "P2009", "P2011", "P2012"].includes(err.code)) {
            return res.status(400).json({
                success: false,
                message: "Dados invalidos.",
                errors: err.meta ?? null
            });
        }
        console.error("Erro Prisma:", { code: err.code, message: err.message });
        return res.status(500).json({
            success: false,
            message: "Erro interno.",
            errors: null
        });
    }
    console.error(err);
    return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        errors: null
    });
}
