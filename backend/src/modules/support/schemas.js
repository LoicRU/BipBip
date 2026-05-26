import { z } from "zod";

export const createSupportTicketSchema = z.object({
  subject: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(5000),
});

export const supportTicketIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});
