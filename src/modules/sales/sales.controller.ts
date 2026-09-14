import { Body, Controller, Get, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { RecordSaleDto } from './dtos/record-sale.dto';
import { SalesService } from './sales.service';

interface AuthenticatedUser {
  id?: string;
  userId?: string;
  email: string;
  role: string;
}

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async recordSale(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RecordSaleDto,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.salesService.recordSale(vendorId, dto);
  }

  @Get()
  async getSales(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.salesService.getSales(vendorId, isNaN(parsedLimit) ? 50 : parsedLimit);
  }

  @Get('summary')
  async getSummary(@CurrentUser() user: AuthenticatedUser) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.salesService.getSummary(vendorId);
  }
}
