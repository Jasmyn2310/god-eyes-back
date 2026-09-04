import { Plan } from '../entities/plan.entity';

export interface IPlanRepository {
  findAll(): Promise<Plan[]>;
}
