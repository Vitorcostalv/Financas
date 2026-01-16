import { ZodTypeAny } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
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
