import { z } from "zod";

export const idSchema = z.string().min(1).max(191);
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const noteSchema = z.object({
  chapterId: idSchema,
  content: z.string().trim().min(1).max(10000),
  timestampSeconds: z.number().finite().min(0).nullable().optional(),
});

export const progressSchema = z.object({
  isCompleted: z.boolean().optional(),
  videoPositionSeconds: z.number().finite().min(0).max(86400).optional(),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().max(10000).nullable().optional(),
  content: z.string().max(200000).nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
  lessonType: z.enum(["VIDEO", "ARTICLE", "TEXT", "MIXED"]).optional(),
  durationSeconds: z.number().int().min(0).max(86400).nullable().optional(),
  isFree: z.boolean().optional(),
  isRequired: z.boolean().optional(),
});

export const quizConfigSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().max(10000).nullable().optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).max(20).optional(),
  isPublished: z.boolean().optional(),
  requiredForCompletion: z.boolean().optional(),
});

export const discussionSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().min(1).max(20000),
  chapterId: idSchema.nullable().optional(),
});
