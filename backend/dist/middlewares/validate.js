"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, _res, next) => {
        const parsed = schema.parse({
            body: req.body,
            params: req.params,
            query: req.query
        });
        if (parsed.body) {
            req.body = parsed.body;
        }
        if (parsed.params) {
            req.params = parsed.params;
        }
        if (parsed.query) {
            req.query = parsed.query;
        }
        next();
    };
};
exports.validate = validate;
