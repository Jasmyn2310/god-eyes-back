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
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

interface AuthenticatedUser {
  id?: string;
  userId?: string;
  email: string;
  role: string;
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async getProducts(@CurrentUser() user: AuthenticatedUser) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.catalogService.getProducts(vendorId);
  }

  @Post()
  async createProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.catalogService.createProduct(vendorId, dto);
  }

  @Put(':id')
  async updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.catalogService.updateProduct(vendorId, id, dto);
  }

  @Delete(':id')
  async deleteProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    await this.catalogService.deleteProduct(vendorId, id);
    return { success: true, message: 'Producto eliminado' };
  }
}
