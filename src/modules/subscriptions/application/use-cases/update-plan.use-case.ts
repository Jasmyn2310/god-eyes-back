import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Plan } from '../../domain/entities/plan.entity';
import type { IPlanRepository } from '../../domain/repositories/iplan.repository';
import { UpdatePlanDto } from '../../infrastructure/dtos/update-plan.dto';

@Injectable()
export class UpdatePlanUseCase {
  constructor(
    @Inject('IPlanRepository') private readonly planRepository: IPlanRepository,
  ) {}

  async execute(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    }

    const partialUpdate = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.price !== undefined ? { price: dto.price } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.isPopular !== undefined ? { isPopular: dto.isPopular } : {}),
      ...(dto.targetRole !== undefined ? { targetRole: dto.targetRole } : {}),
      ...(dto.durationDays !== undefined ? { durationDays: dto.durationDays } : {}),
    };

    return this.planRepository.update(id, partialUpdate);
  }
}
