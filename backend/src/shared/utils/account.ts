import { AppError } from "../../utils/errors";

export type AccountType =
  | "WALLET"
  | "EXPENSE_POOL"
  | "EXTRA_POOL"
  | "CREDIT_CARD";

export function normalizeAccountType(type: string): AccountType {
  const normalized = type.trim().toUpperCase();

  if (normalized === "BANK") {
    return "WALLET";
  }

  if (normalized === "CREDIT") {
    return "CREDIT_CARD";
  }

  if (
    normalized === "WALLET" ||
    normalized === "EXPENSE_POOL" ||
    normalized === "EXTRA_POOL" ||
    normalized === "CREDIT_CARD"
  ) {
    return normalized;
  }

  throw new AppError("Tipo de conta invalido.", 400);
}
