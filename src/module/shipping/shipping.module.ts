import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { RajaOngkirService } from './service/rajaOngkit.service';

@Module({
  imports: [],
  controllers: [ShippingController],
  providers: [RajaOngkirService],
  exports: [],
})
export class ShippingModule {}
