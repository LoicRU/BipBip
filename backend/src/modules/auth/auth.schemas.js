import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["tech", "recruiter"]).default("tech"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(8),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
});
