import { Plan } from '../entities/plan.entity';

export interface IPlanRepository {
  findAll(targetRole?: string): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  create(plan: Plan): Promise<Plan>;
  update(id: string, partial: Partial<Omit<Plan, 'id'>>): Promise<Plan>;
  delete(id: string): Promise<void>;
}
