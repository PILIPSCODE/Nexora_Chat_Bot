import z, { ZodType } from 'zod';

export class SubcribtionValidation {
  static readonly Subcribtion: ZodType = z.object({
    name: z.string().min(1).max(100),
    price: z.number(),
    durationDays: z.number(),
    initialToken: z.string().min(1),
  });
  static readonly changeSubcribtion: ZodType = z.object({
    id: z.string().min(1).max(225),
    name: z.string().min(1).max(100),
    price: z.number(),
    initialToken: z.string().min(1),
    durationDays: z.number(),
  });
}
