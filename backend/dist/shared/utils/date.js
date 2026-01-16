"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthRange = getMonthRange;
function getMonthRange(year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start, end };
}
