import z, { ZodType } from 'zod';

const OrderItem = z.object({
  productId: z.string().min(1).max(225),
  quantity: z.number(),
  price: z.number(),
});

export class OrderValidation {
  static readonly Order: ZodType = z.object({
    customerId: z.string().min(1).max(225),
    botId: z.string().min(1).max(225),
    status: z.string().min(1),
    price: z.number(),
    orderitems: z.array(OrderItem).min(1),
  });
  static readonly changeOrder: ZodType = z.object({
    id: z.string().min(1).max(225),
    customerId: z.string().min(1).max(225),
    botId: z.string().min(1).max(225),
    status: z.string().min(1),
    price: z.number(),
    totalAmount: z.number(),
    orderitems: z.array(OrderItem).min(1),
  });
  static readonly Pagination: ZodType = z.object({
    page: z.string().min(1).max(50),
    limit: z.string().min(1).max(50),
    customerId: z.string().min(1).max(225).optional(),
    status: z.string().min(1).optional(),
  });
}
