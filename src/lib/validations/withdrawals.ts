import { z } from "zod";

export const createWithdrawalSchema = z.object({
  coinBoxId: z.coerce.number().int().positive(),
  houseId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().positive().max(100_000_000),
  notes: z.string().trim().max(500).optional(),
  collectedAt: z.coerce.date().optional()
});

export const rejectWithdrawalSchema = z.object({
  reason: z.string().trim().min(3).max(500).optional()
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
