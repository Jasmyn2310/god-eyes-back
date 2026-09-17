import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Plan } from '../../domain/entities/plan.entity';
import type { IPlanRepository } from '../../domain/repositories/iplan.repository';
import { CreatePlanDto } from '../../infrastructure/dtos/create-plan.dto';

@Injectable()
export class CreatePlanUseCase {
  constructor(
    @Inject('IPlanRepository') private readonly planRepository: IPlanRepository,
  ) {}

  async execute(dto: CreatePlanDto): Promise<Plan> {
    const plan = new Plan(
      randomUUID(),
      dto.name,
      dto.price,
      dto.description,
      dto.isPopular ?? false,
      dto.targetRole ?? 'vendor',
      dto.durationDays ?? 30,
    );
    return this.planRepository.create(plan);
  }
}
