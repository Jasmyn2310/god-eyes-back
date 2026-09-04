import { Module } from '@nestjs/common';
import { VendorsGateway } from './infrastructure/gateways/vendors.gateway';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  controllers: [VendorsController],
  providers: [VendorsGateway, VendorsService],
})
export class VendorsModule {}
