import { Controller, Get, Param } from '@nestjs/common';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async getAllVendors() {
    return this.vendorsService.getAllVendors();
  }

  @Get(':id/detail')
  async getVendorDetail(@Param('id') id: string) {
    return this.vendorsService.getVendorDetail(id);
  }
}
