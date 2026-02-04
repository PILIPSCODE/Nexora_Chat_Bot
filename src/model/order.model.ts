import { Order } from '@prisma/client';
import { Pagination } from './web.model';

export class OrderApi {
  customerId: string;
  botId: string;
  price: number;
  status: string;
  orderItems: OrderItem[];
}

export class GetOrder {
  customerId?: string;
  status?: string;
  page: string;
  limit: string;
}

export class ChangeOrder {
  id: string;
  customerId: string;
  botId: string;
  price: number;
  status: string;
  totalAmount: number;
  orderItems: OrderItem[];
}

export class OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export class PaginationResponseOrder {
  Order: Order[];
  Pagination: Pagination;
}
