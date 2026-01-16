import { z } from "zod";

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    limit: z.number().positive("Limit must be positive"),
    current: z.number().nonnegative().optional(),
    month: z.number().int().min(1).max(12)
  })
});
