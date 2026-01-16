"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const routes_1 = require("./routes");
const errorHandler_1 = require("./middlewares/errorHandler");
zod_1.z.setErrorMap((issue, ctx) => {
    if (issue.code === zod_1.ZodIssueCode.invalid_type) {
        if (issue.received === "undefined") {
            return { message: "Campo obrigatorio" };
        }
        return { message: "Tipo invalido" };
    }
    if (issue.code === zod_1.ZodIssueCode.invalid_string) {
        if (issue.validation === "email") {
            return { message: "Email invalido" };
        }
        return { message: "Texto invalido" };
    }
    if (issue.code === zod_1.ZodIssueCode.invalid_date) {
        return { message: "Data invalida" };
    }
    if (issue.code === zod_1.ZodIssueCode.too_small) {
        return { message: "Valor muito pequeno" };
    }
    if (issue.code === zod_1.ZodIssueCode.too_big) {
        return { message: "Valor muito grande" };
    }
    if (issue.code === zod_1.ZodIssueCode.custom && issue.message) {
        return { message: issue.message };
    }
    return { message: ctx.defaultError || "Valor invalido" };
});
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/health", (_req, res) => {
    res.json({ success: true, message: "OK" });
});
app.use(routes_1.routes);
app.use(errorHandler_1.errorHandler);
