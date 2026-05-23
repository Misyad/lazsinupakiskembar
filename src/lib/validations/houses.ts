import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+62|62|0)8[0-9]{8,13}$/, "Nomor HP tidak valid.")
  .optional()
  .or(z.literal(""));

export const createHouseSchema = z.object({
  areaId: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(3).max(140),
  phone: phoneSchema,
  address: z.string().trim().min(5).max(255),
  rtRw: z.string().trim().min(3).max(30),
  joinedAt: z.coerce.date().optional()
});

export const updateHouseSchema = createHouseSchema.partial().extend({
  active: z.boolean().optional()
});

export type CreateHouseInput = z.infer<typeof createHouseSchema>;
export type UpdateHouseInput = z.infer<typeof updateHouseSchema>;
