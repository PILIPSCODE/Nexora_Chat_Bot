import { Injectable } from '@nestjs/common';
import Xendit from 'xendit-node';

@Injectable()
export class XenditService {
  private clients = new Map<string, any>();

  private getClient(userId: string, secretKey: string) {
    const cacheKey = userId;

    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey);
    }

    const xendit = new Xendit({ secretKey });

    this.clients.set(cacheKey, xendit);
    return xendit;
  }

  async createInvoice(
    userId: string,
    orderId: string,
    amount: number,
    customer: any,
    items: any[],
    secretKey: string,
  ) {
    const xendit = this.getClient(userId, secretKey);
    const { Invoice } = xendit;

    return await Invoice.createInvoice({
      externalID: orderId,
      amount,
      payerEmail: customer.email,
      description: `Payment ${orderId}`,
      items,
      customer: {
        given_names: customer.firstName,
        surname: customer.lastName || '',
        email: customer.email,
        mobile_number: customer.phone,
      },
    });
  }
}
