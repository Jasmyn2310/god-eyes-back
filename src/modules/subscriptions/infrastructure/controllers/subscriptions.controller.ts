import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { CreatePlanUseCase } from '../../application/use-cases/create-plan.use-case';
import { DeletePlanUseCase } from '../../application/use-cases/delete-plan.use-case';
import { GetPlansUseCase } from '../../application/use-cases/get-plans.use-case';
import { UpdatePlanUseCase } from '../../application/use-cases/update-plan.use-case';
import { CreatePlanDto } from '../dtos/create-plan.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly getPlansUseCase: GetPlansUseCase,
    private readonly createPlanUseCase: CreatePlanUseCase,
    private readonly updatePlanUseCase: UpdatePlanUseCase,
    private readonly deletePlanUseCase: DeletePlanUseCase,
  ) {}

  @Get('plans')
  async getPlans(@Query('targetRole') targetRole?: string) {
    return this.getPlansUseCase.execute(targetRole);
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.createPlanUseCase.execute(dto);
  }

  @Put('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.updatePlanUseCase.execute(id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deletePlan(@Param('id') id: string) {
    return this.deletePlanUseCase.execute(id);
  }
}
