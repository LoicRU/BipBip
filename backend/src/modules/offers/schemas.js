import { z } from "zod";

export const listOffersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
  type: z.string().trim().optional(),
  location: z.string().trim().optional(),
  remote: z
    .union([z.literal("true"), z.literal("false"), z.literal("yes"), z.literal("no")])
    .optional(),
  minSalary: z.coerce.number().int().min(0).optional(),
  maxSalary: z.coerce.number().int().min(0).optional(),
  mine: z
    .union([z.literal("true"), z.literal("false")])
    .optional(),
});

export const offerIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const createOfferSchema = z.object({
  title: z.string().trim().min(2).max(160),
  type: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  remote: z.boolean().default(false),
  salary: z.string().trim().max(80).optional().default(""),
  experience: z.string().trim().max(80).optional().default(""),
  description: z.string().trim().min(10),
  requirements: z.array(z.string().trim().min(1)).default([]),
  benefits: z.array(z.string().trim().min(1)).default([]),
  hasAiTest: z.boolean().default(false),
  aiQuestions: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(["active", "archived"]).optional().default("active"),
});

export const updateOfferSchema = createOfferSchema.partial();
