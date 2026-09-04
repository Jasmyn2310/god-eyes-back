import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly getStatsUseCase: GetDashboardStatsUseCase) {}

  @Get('dashboard-stats')
  @Roles('ADMIN')
  async getDashboardStats() {
    return this.getStatsUseCase.execute();
  }
}
