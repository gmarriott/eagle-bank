import { z } from 'zod';

/**
 * Zod schemas shared between forms and unit tests
 * - infers TypeScript types from a single definition
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: z
    .string()
    .min(7, 'Enter a valid phone number.')
    .regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/\d/, 'Password must contain at least one number.')
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: z.string().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number.'),
  address: z.string().max(160, 'Address is too long.'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
