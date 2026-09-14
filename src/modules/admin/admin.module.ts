import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { GetAdminVendorDetailUseCase } from './application/use-cases/get-admin-vendor-detail.use-case';
import { GetAdminVendorsUseCase } from './application/use-cases/get-admin-vendors.use-case';
import { GetDashboardStatsUseCase } from './application/use-cases/get-dashboard-stats.use-case';
import { AdminController } from './infrastructure/controllers/admin.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [
    GetDashboardStatsUseCase,
    GetAdminVendorsUseCase,
    GetAdminVendorDetailUseCase,
  ],
})
export class AdminModule {}
