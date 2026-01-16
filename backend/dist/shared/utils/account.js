"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAccountType = normalizeAccountType;
const errors_1 = require("../../utils/errors");
function normalizeAccountType(type) {
    const normalized = type.trim().toUpperCase();
    if (normalized === "BANK") {
        return "WALLET";
    }
    if (normalized === "CREDIT") {
        return "CREDIT_CARD";
    }
    if (normalized === "WALLET" ||
        normalized === "EXPENSE_POOL" ||
        normalized === "EXTRA_POOL" ||
        normalized === "CREDIT_CARD") {
        return normalized;
    }
    throw new errors_1.AppError("Tipo de conta invalido.", 400);
}
