import { z } from "zod";

export const createExpenseSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().positive().max(100_000_000),
  transactionAt: z.coerce.date(),
  description: z.string().trim().min(3).max(255),
  reason: z.string().trim().min(3).max(500)
});

export const createAdjustmentSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().max(100_000_000).refine((value) => value !== 0, "Nominal adjustment tidak boleh 0."),
  transactionAt: z.coerce.date(),
  description: z.string().trim().min(3).max(255),
  reason: z.string().trim().min(3).max(500),
  approved: z.literal(true)
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;
