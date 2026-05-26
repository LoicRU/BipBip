import { z } from "zod";

export const createReportSchema = z.object({
  type: z.enum(["job", "user"]),
  jobId: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  title: z.string().trim().max(160).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  reason: z.string().trim().min(3).max(500),
  description: z.string().trim().max(5000).optional().default(""),
});

export const reportIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});
