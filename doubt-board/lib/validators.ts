import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60, "Name is too long"),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  role: z.enum(["student", "teacher"]),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const createSessionSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(100, "Title is too long"),
  subject: z.string().trim().min(2, "Subject is too short").max(60, "Subject is too long"),
});

export const joinSessionSchema = z.object({
  joinCode: z.string().trim().regex(/^\d{6}$/, "Join code must be 6 digits"),
});

export const createDoubtSchema = z.object({
  text: z.string().trim().min(3, "Doubt is too short").max(500, "Doubts can be at most 500 characters"),
  topic: z.string().trim().min(1).max(40, "Topic is too long").default("General"),
  isAnonymous: z.boolean().default(true),
});

export const answerDoubtSchema = z.object({
  answer: z.string().trim().max(2000, "Answer is too long").optional(),
});

export const doubtStatusSchema = z.enum(["open", "answered"]);

export const similarQuerySchema = z.object({
  q: z.string().trim().min(3, "Query is too short").max(500),
});
