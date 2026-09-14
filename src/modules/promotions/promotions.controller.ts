import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { CreatePromotionDto } from './dtos/create-promotion.dto';
import { UpdatePromotionDto } from './dtos/update-promotion.dto';
import { PromotionsService } from './promotions.service';

interface AuthenticatedUser {
  id?: string;
  userId?: string;
  email: string;
  role: string;
}

@Controller('promotions')
@UseGuards(JwtAuthGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  async getPromotions(@CurrentUser() user: AuthenticatedUser) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.promotionsService.getPromotions(vendorId);
  }

  @Post()
  async createPromotion(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePromotionDto,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.promotionsService.createPromotion(vendorId, dto);
  }

  @Put(':id')
  async updatePromotion(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.promotionsService.updatePromotion(vendorId, id, dto);
  }

  @Delete(':id')
  async deletePromotion(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    await this.promotionsService.deletePromotion(vendorId, id);
    return { success: true, message: 'Promoción eliminada' };
  }
}
