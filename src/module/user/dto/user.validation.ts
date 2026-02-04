import z, { ZodType } from 'zod';

export class userValidation {
  static readonly RequestUser: ZodType = z.object({
    id: z.string().min(1).max(225),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    picture: z.string().min(1).max(225).optional(),
  });
  static readonly VerifPassword: ZodType = z.object({
    id: z.string().min(1).max(225),
    codeOTP: z.string().min(6).max(6),
    email: z.string().min(1).max(50),
    password: z.string().min(1).max(50),
  });
  static readonly UpdatePassword: ZodType = z.object({
    id: z.string().min(1).max(225),
    email: z.string().min(1).max(50),
  });
  static readonly ChangePassword: ZodType = z.object({
    oldPassword: z.string().min(1).max(225),
    newPassword: z.string().min(1).max(255),
    email: z.string().min(1).max(50),
  });
}
