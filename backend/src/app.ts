import express from "express";
import cors from "cors";
import { z, ZodIssueCode } from "zod";
import { routes } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

z.setErrorMap((issue, ctx) => {
  if (issue.code === ZodIssueCode.invalid_type) {
    if (issue.received === "undefined") {
      return { message: "Campo obrigatorio" };
    }
    return { message: "Tipo invalido" };
  }

  if (issue.code === ZodIssueCode.invalid_string) {
    if (issue.validation === "email") {
      return { message: "Email invalido" };
    }
    return { message: "Texto invalido" };
  }

  if (issue.code === ZodIssueCode.invalid_date) {
    return { message: "Data invalida" };
  }

  if (issue.code === ZodIssueCode.too_small) {
    return { message: "Valor muito pequeno" };
  }

  if (issue.code === ZodIssueCode.too_big) {
    return { message: "Valor muito grande" };
  }

  if (issue.code === ZodIssueCode.custom && issue.message) {
    return { message: issue.message };
  }

  return { message: ctx.defaultError || "Valor invalido" };
});

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.use(routes);
app.use(errorHandler);

export { app };
