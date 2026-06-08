import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3).max(225),
  email: z.string().email(),
  password: z.string().min(6),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateMeSchema = z.object({
  name: z.string().min(3).max(225).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
  password: z.string().min(6).optional(),
});
