import { z } from "zod";

const nonEmptyTrimmedString = z.string().trim().min(1);

export const generateCvSchema = z.object({
  name: nonEmptyTrimmedString.min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional().default(""),
  title: nonEmptyTrimmedString.min(2).max(120),
  experience: z.string().trim().min(10).max(4000),
  skills: z.string().trim().min(2).max(1000),
  education: z.string().trim().min(2).max(2000),
});

export const generateCoverLetterSchema = z.object({
  name: nonEmptyTrimmedString.min(2).max(120),
  title: z.string().trim().max(120).optional().default(""),
  company: nonEmptyTrimmedString.min(2).max(120),
  position: nonEmptyTrimmedString.min(2).max(120),
  motivation: z.string().trim().min(10).max(3000),
  skills: z.string().trim().max(1000).optional().default(""),
  experience: z.string().trim().max(4000).optional().default(""),
  education: z.string().trim().max(2000).optional().default(""),
});

export const generateInterviewQuestionsSchema = z.object({
  title: nonEmptyTrimmedString.min(2).max(160),
  description: z.string().trim().min(10).max(5000),
  requirements: z.array(nonEmptyTrimmedString.max(200)).default([]),
  experience: z.string().trim().max(120).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  type: z.string().trim().max(80).optional().default(""),
});

export const evaluateInterviewSchema = z.object({
  jobId: z.string().trim().optional(),
  title: nonEmptyTrimmedString.min(2).max(160),
  description: z.string().trim().min(10).max(5000),
  requirements: z.array(nonEmptyTrimmedString.max(200)).default([]),
  answers: z
    .array(
      z.object({
        question: nonEmptyTrimmedString.max(500),
        answer: nonEmptyTrimmedString.max(4000),
        timestamp: z.string().trim().optional(),
      })
    )
    .min(1)
    .max(20),
});
