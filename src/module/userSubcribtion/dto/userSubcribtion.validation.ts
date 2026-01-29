import z, { ZodType } from 'zod';

export class UserSubcribtionValidation {
  static readonly UserSubcribtion: ZodType = z.object({
    userId: z.string().min(1).max(225),
    subcribtionId: z.number(),
  });
  static readonly changeUserSubcribtion: ZodType = z.object({
    id: z.string().min(1).max(225),
    userId: z.string().min(1).max(225),
    subcribtionId: z.number(),
    tokenRemain: z.string().min(1),
  });
}
