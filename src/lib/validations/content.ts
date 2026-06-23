import { z } from "zod";

export const DOC_ACCENTS = ["emerald", "amber", "sky", "rose", "violet"] as const;

export const createProgramSchema = z.object({
  title: z.string().trim().min(3).max(160),
  amount: z.coerce.number().int().min(0).default(0),
  status: z.string().trim().min(1).max(40).default("Berjalan"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().optional()
});

export const updateProgramSchema = createProgramSchema.partial();

export const createDocumentationSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(255),
  accent: z.enum(DOC_ACCENTS).default("emerald"),
  imageId: z.coerce.number().int().positive().nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().optional()
});

export const updateDocumentationSchema = createDocumentationSchema.partial();

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type CreateDocumentationInput = z.infer<typeof createDocumentationSchema>;
export type UpdateDocumentationInput = z.infer<typeof updateDocumentationSchema>;
