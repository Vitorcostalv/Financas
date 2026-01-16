"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const env_1 = require("./env");
exports.jwtConfig = {
    secret: env_1.env.JWT_SECRET,
    expiresIn: env_1.env.JWT_EXPIRES_IN
};
