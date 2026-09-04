import { Inject, Injectable } from '@nestjs/common';
import type { IPlanRepository } from '../../domain/repositories/iplan.repository';
import { Plan } from '../../domain/entities/plan.entity';

@Injectable()
export class GetPlansUseCase {
  constructor(
    @Inject('IPlanRepository') private readonly planRepository: IPlanRepository,
  ) {}

  async execute(): Promise<Plan[]> {
    return this.planRepository.findAll();
  }
}
