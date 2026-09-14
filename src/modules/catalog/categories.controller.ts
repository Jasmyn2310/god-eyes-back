import { Body, Controller, Delete, Get, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dtos/create-category.dto';

interface AuthenticatedUser {
  id?: string;
  userId?: string;
  email: string;
  role: string;
}

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async getCategories(@CurrentUser() user: AuthenticatedUser) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.catalogService.getCategories(vendorId);
  }

  @Post()
  async createCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.catalogService.createCategory(vendorId, dto);
  }

  @Delete(':id')
  async deleteCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const vendorId = user.id || user.userId;
    if (!vendorId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    await this.catalogService.deleteCategory(vendorId, id);
    return { success: true, message: 'Categoría eliminada' };
  }
}
