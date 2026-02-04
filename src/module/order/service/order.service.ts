import { HttpException, Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { ValidationService } from 'src/module/common/other/validation.service';
import {
  ChangeOrder,
  PaginationResponseOrder,
  OrderApi,
  GetOrder,
} from 'src/model/order.model';
import { OrderValidation } from '../dto/order.validation';

@Injectable()
export class OrderService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getOrderByCustomerId(
    query: GetOrder,
  ): Promise<PaginationResponseOrder> {
    const OrderValid: GetOrder = this.validationService.validate(
      OrderValidation.Pagination,
      query,
    );
    if (!OrderValid) throw new HttpException('Validation Error', 400);
    const { page, limit, customerId, status } = OrderValid;
    if (customerId == '' || !customerId)
      throw new HttpException('Validation Error', 400);

    const whereClause: any = {
      customerId,
      ...(status && { status: String(status) }),
    };

    const data = await this.prismaService.order.findMany({
      where: whereClause,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    const totalData = await this.prismaService.order.count({
      where: {
        customerId: customerId,
      },
    });

    return {
      Order: data,
      Pagination: {
        page: Number(page),
        pageSize: Number(limit),
        totalItems: totalData,
        totalPages: totalData / Number(limit),
      },
    };
  }
  async getOrder(query: GetOrder): Promise<PaginationResponseOrder> {
    const OrderValid: GetOrder = this.validationService.validate(
      OrderValidation.Pagination,
      query,
    );
    if (!OrderValid) throw new HttpException('Validation Error', 400);
    const { page, limit } = OrderValid;

    const data = await this.prismaService.order.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });
    const totalData = await this.prismaService.order.count();

    return {
      Order: data,
      Pagination: {
        page: Number(page),
        pageSize: Number(limit),
        totalItems: totalData,
        totalPages: totalData / Number(limit),
      },
    };
  }

  async getOrderbyId(id: string): Promise<Order> {
    try {
      if (!id) throw new HttpException('Validation Error', 400);

      const data = await this.prismaService.order.findFirst({
        where: {
          id: id,
        },
      });

      if (!data) throw new HttpException('Cannot Find Order', 403);

      return data;
    } catch (error) {
      throw new HttpException('OrderId is Invalid', 400);
    }
  }

  async addNewOrder(req: OrderApi): Promise<Order> {
    const OrderValid: OrderApi = this.validationService.validate(
      OrderValidation.Order,
      req,
    );

    if (!OrderValid) {
      throw new HttpException('Validation Error', 400);
    }

    const productIds = OrderValid.orderItems.map((i) => i.productId);

    const products = await this.prismaService.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });

    if (products.length !== productIds.length) {
      throw new HttpException('Some products not found', 400);
    }

    const priceMap = new Map(products.map((p) => [p.id, p.price]));

    const orderItems = OrderValid.orderItems.map((item) => {
      const price = priceMap.get(item.productId);

      if (price === undefined) {
        throw new HttpException(`Product ${item.productId} not found`, 400);
      }

      return {
        quantity: item.quantity,
        price,
        product: {
          connect: {
            id: item.productId,
          },
        },
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const data = await this.prismaService.order.create({
      data: {
        customerId: OrderValid.customerId,
        botId: OrderValid.botId,
        status: 'PENDING',
        totalAmount,

        orderitems: {
          create: orderItems,
        },
      },
      include: {
        orderitems: true,
      },
    });

    return data;
  }
  async editOrder(req: ChangeOrder) {
    try {
      const OrderValid: ChangeOrder = this.validationService.validate(
        OrderValidation.changeOrder,
        req,
      );

      if (!OrderValid) {
        throw new HttpException('Validation Error', 400);
      }

      const existingOrder = await this.prismaService.order.findUnique({
        where: { id: req.id },
        include: { orderitems: true },
      });

      if (!existingOrder) {
        throw new HttpException('Order not found', 404);
      }

      const productIds = OrderValid.orderItems.map((i) => i.productId);

      const products = await this.prismaService.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true },
      });

      if (products.length !== productIds.length) {
        throw new HttpException('Invalid product list', 400);
      }

      const priceMap = new Map(products.map((p) => [p.id, p.price]));

      const orderItems = OrderValid.orderItems.map((item) => {
        const price = priceMap.get(item.productId);

        if (price === undefined) {
          throw new HttpException(`Product ${item.productId} not found`, 400);
        }

        return {
          quantity: item.quantity,
          price,
          product: {
            connect: { id: item.productId },
          },
        };
      });

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const data = await this.prismaService.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({
          where: { orderId: req.id },
        });

        return tx.order.update({
          where: { id: req.id },
          data: {
            totalAmount,
            orderitems: {
              create: orderItems,
            },
          },
          include: {
            orderitems: true,
          },
        });
      });

      return data;
    } catch (error) {
      console.log(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('OrderId is Invalid', 400);
    }
  }
  async deleteOrder(id: string) {
    if (!id) throw new HttpException('Validation Error', 400);

    try {
      const data = await this.prismaService.order.delete({
        where: {
          id: id,
        },
      });
      return true;
    } catch (error) {
      throw new HttpException('OrderId is Invalid', 400);
    }
  }
}
