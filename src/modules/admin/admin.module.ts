import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { GetDashboardStatsUseCase } from './application/use-cases/get-dashboard-stats.use-case';
import { AdminController } from './infrastructure/controllers/admin.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [GetDashboardStatsUseCase],
})
export class AdminModule {}
