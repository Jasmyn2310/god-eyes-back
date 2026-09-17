import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPlanRepository } from '../../domain/repositories/iplan.repository';

@Injectable()
export class DeletePlanUseCase {
  constructor(
    @Inject('IPlanRepository') private readonly planRepository: IPlanRepository,
  ) {}

  async execute(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    }

    await this.planRepository.delete(id);
    return { success: true, message: 'Plan eliminado correctamente' };
  }
}
