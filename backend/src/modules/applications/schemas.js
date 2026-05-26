import { z } from "zod";

export const createApplicationSchema = z.object({
  offerId: z.string().trim().min(1),
  coverLetter: z.string().trim().max(5000).optional().default(""),
  cv: z.string().trim().max(255).optional().default(""),
  candidatePhone: z.string().trim().max(40).optional().default(""),
  aiInterview: z.unknown().optional().default(null),
});

export const applicationIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]),
});
