import { Module } from '@nestjs/common';
import { CreatePlanUseCase } from './application/use-cases/create-plan.use-case';
import { DeletePlanUseCase } from './application/use-cases/delete-plan.use-case';
import { GetPlansUseCase } from './application/use-cases/get-plans.use-case';
import { UpdatePlanUseCase } from './application/use-cases/update-plan.use-case';
import { SubscriptionsController } from './infrastructure/controllers/subscriptions.controller';
import { DrizzlePlanRepository } from './infrastructure/persistence/drizzle-plan.repository';

@Module({
  controllers: [SubscriptionsController],
  providers: [
    GetPlansUseCase,
    CreatePlanUseCase,
    UpdatePlanUseCase,
    DeletePlanUseCase,
    { provide: 'IPlanRepository', useClass: DrizzlePlanRepository },
  ],
})
export class SubscriptionsModule {}

