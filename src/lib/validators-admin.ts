import { z } from "zod";

export const classCreateSchema = z.object({
  title: z.string().min(2, "Título muy corto").max(120),
  description: z.string().max(4000).optional().default(""),
  categoryId: z.string().uuid("Elegí una categoría"),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  durationSeconds: z.coerce.number().int().min(0).default(0),
  equipment: z.array(z.string()).default([]),
});

export const classUpdateSchema = classCreateSchema.extend({
  thumbnailUrl: z.string().url().nullable().optional(),
});

export type ClassCreateInput = z.infer<typeof classCreateSchema>;
export type ClassUpdateInput = z.infer<typeof classUpdateSchema>;

export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(60),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
