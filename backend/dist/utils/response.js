"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = sendResponse;
function sendResponse(res, status, message, data) {
    return res.status(status).json({
        success: true,
        message,
        data: data ?? null
    });
}
