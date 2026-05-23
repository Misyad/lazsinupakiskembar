import { z } from "zod";

export const createCoinBoxSchema = z.object({
  boxNumber: z.string().trim().min(3).max(60),
  status: z.enum(["ACTIVE", "LOST", "DAMAGED", "INACTIVE"]).optional(),
  distributedAt: z.coerce.date().optional()
});

export const assignCoinBoxSchema = z.object({
  houseId: z.coerce.number().int().positive(),
  assignedAt: z.coerce.date().optional()
});

export type CreateCoinBoxInput = z.infer<typeof createCoinBoxSchema>;
export type AssignCoinBoxInput = z.infer<typeof assignCoinBoxSchema>;
