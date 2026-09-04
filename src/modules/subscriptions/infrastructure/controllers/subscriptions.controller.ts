import { Controller, Get } from '@nestjs/common';
import { GetPlansUseCase } from '../../application/use-cases/get-plans.use-case';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly getPlansUseCase: GetPlansUseCase) {}

  @Get('plans')
  async getPlans() {
    return this.getPlansUseCase.execute();
  }
}
