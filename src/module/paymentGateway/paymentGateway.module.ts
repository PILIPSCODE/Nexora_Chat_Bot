import { Module } from '@nestjs/common';
import { MidtransService } from './service/midtrans.service';
import { XenditService } from './service/xendit.service';
import { paymentGatewayController } from './paymentGateway.controller';

@Module({
  imports: [],
  controllers: [paymentGatewayController],
  providers: [MidtransService, XenditService],
})
export class PaymentGatewayModule {}
