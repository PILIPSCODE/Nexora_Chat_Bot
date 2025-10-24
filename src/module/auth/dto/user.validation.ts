import z, { ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().min(1).max(50),
    password: z.string().min(1).max(100),
  });
  static readonly LOGIN: ZodType = z.object({
    email: z.string().min(1).max(50),
    password: z.string().min(1).max(100),
  });
  static readonly OTP: ZodType = z.object({
    codeOTP: z.string().min(6).max(6),
    email: z.string().min(1).max(50),
  });
}
