import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChangeOrder, GetOrder, OrderApi } from 'src/model/order.model';
import { WebResponse } from 'src/model/web.model';
import { OrderService } from './service/order.service';
import { Order } from '@prisma/client';

@Controller('api')
export class OrderController {
  constructor(private orderService: OrderService) {}
  @Post('order')
  @HttpCode(200)
  async addNewOrder(@Body() body: OrderApi): Promise<WebResponse<Order>> {
    const data = await this.orderService.addNewOrder(body);
    return {
      data: data,
      message: 'Order created succesfully!!',
      status: '200',
    };
  }

  @Get('order')
  @HttpCode(200)
  async getOrder(@Query() query: GetOrder): Promise<WebResponse<Order[]>> {
    const data = await this.orderService.getOrderByCustomerId(query);
    return {
      data: data.Order,
      pagination: data.Pagination,
      status: '200',
    };
  }
  @Get('/admin/order')
  @HttpCode(200)
  async getOrderAdmin(@Query() query: GetOrder): Promise<WebResponse<Order[]>> {
    const data = await this.orderService.getOrder(query);
    return {
      data: data.Order,
      pagination: data.Pagination,
      status: '200',
    };
  }
  @Get('order/:id')
  @HttpCode(200)
  async getOrderbyid(@Param('id') id: string): Promise<WebResponse<Order>> {
    const data = await this.orderService.getOrderbyId(id);
    return {
      data: data,
      status: '200',
    };
  }

  @Patch('order/:id')
  @HttpCode(200)
  async editOrder(
    @Body() body: ChangeOrder,
    @Param('id') id: string,
  ): Promise<WebResponse<Order>> {
    const data = await this.orderService.editOrder({
      ...body,
      id: id,
    });
    return {
      data: data,
      message: 'Order updated succesfully!!',
      status: '200',
    };
  }
  @Delete('order/:id')
  @HttpCode(200)
  async deleteOrder(@Param('id') id: string): Promise<WebResponse<OrderApi>> {
    await this.orderService.deleteOrder(id);
    return {
      message: 'Order deleted succesfully!!',
      status: '200',
    };
  }
}
