import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\\+62|62|0)8[0-9]{8,13}$/, "Nomor HP tidak valid.")
  .optional()
  .or(z.literal(""));

export const createHouseSchema = z.object({
  areaId: z.coerce.number().int().positive().optional(),
  headOfFamily: z.string().trim().min(3).max(140),
  spouseName: z.string().trim().max(140).optional().or(z.literal("")),
  phone: phoneSchema,
  whatsapp: phoneSchema,
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().trim().min(5).max(255),
  rt: z.string().trim().min(1).max(10),
  rw: z.string().trim().min(1).max(10),
  hamlet: z.string().trim().min(1).max(60),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  locationNote: z.string().trim().max(255).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  status: z.enum(["aktif", "belum_dipasang", "nonaktif", "menolak", "pindah", "ditarik"]).optional(),
  officerId: z.coerce.number().int().positive().optional().nullable(),
  surveyDate: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  joinedAt: z.coerce.date().optional(),
  // Photos
  photoFront: z.string().optional(),
  photoBox: z.string().optional(),
  photoOwner: z.string().optional(),
});

export const updateHouseSchema = createHouseSchema.partial().extend({
  status: z.enum(["aktif", "belum_dipasang", "nonaktif", "menolak", "pindah", "ditarik"]).optional(),
});

export type CreateHouseInput = z.infer<typeof createHouseSchema>;
export type UpdateHouseInput = z.infer<typeof updateHouseSchema>;
