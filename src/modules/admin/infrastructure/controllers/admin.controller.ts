import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { GetAdminVendorDetailUseCase } from '../../application/use-cases/get-admin-vendor-detail.use-case';
import { GetAdminVendorsUseCase } from '../../application/use-cases/get-admin-vendors.use-case';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly getStatsUseCase: GetDashboardStatsUseCase,
    private readonly getAdminVendorsUseCase: GetAdminVendorsUseCase,
    private readonly getAdminVendorDetailUseCase: GetAdminVendorDetailUseCase,
  ) {}

  @Get('dashboard-stats')
  @Roles('ADMIN')
  async getDashboardStats() {
    return this.getStatsUseCase.execute();
  }

  @Get('vendors')
  @Roles('ADMIN')
  async getVendors() {
    return this.getAdminVendorsUseCase.execute();
  }

  @Get('vendors/:id')
  @Roles('ADMIN')
  async getVendorDetail(@Param('id') id: string) {
    return this.getAdminVendorDetailUseCase.execute(id);
  }
}
