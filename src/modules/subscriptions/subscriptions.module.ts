import { Module } from '@nestjs/common';
import { DrizzlePlanRepository } from './infrastructure/persistence/drizzle-plan.repository';
import { GetPlansUseCase } from './application/use-cases/get-plans.use-case';
import { SubscriptionsController } from './infrastructure/controllers/subscriptions.controller';

@Module({
  controllers: [SubscriptionsController],
  providers: [
    GetPlansUseCase,
    { provide: 'IPlanRepository', useClass: DrizzlePlanRepository },
  ],
})
export class SubscriptionsModule {}
