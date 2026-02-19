import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const scanSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  productId: z.string().optional(),
  productName: z.string().optional(),
  carbonFootprint: z.number().optional(),
});

export const challengeAcceptSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  preferences: z.record(z.unknown()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ScanInput = z.infer<typeof scanSchema>;
export type ChallengeAcceptInput = z.infer<typeof challengeAcceptSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
