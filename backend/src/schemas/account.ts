import { z } from "zod";

const accountType = z.enum(["BANK", "WALLET", "CREDIT"]);

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    type: accountType,
    balance: z.number().optional()
  })
});
