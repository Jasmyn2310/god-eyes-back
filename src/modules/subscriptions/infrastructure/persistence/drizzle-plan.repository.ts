import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../../../database/database.module';
import { plans } from '../../../../database/schema';
import { Plan } from '../../domain/entities/plan.entity';
import { IPlanRepository } from '../../domain/repositories/iplan.repository';

@Injectable()
export class DrizzlePlanRepository implements IPlanRepository {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async findAll(targetRole?: string): Promise<Plan[]> {
    let query = this.db.select().from(plans);
    if (targetRole) {
      const records = await this.db.select().from(plans).where(eq(plans.targetRole, targetRole));
      return records.map(
        (r) =>
          new Plan(
            r.id,
            r.name,
            Number(r.price),
            r.description,
            r.isPopular,
            (r.targetRole as 'vendor' | 'client') || 'vendor',
            r.durationDays ?? 30,
          ),
      );
    }

    const records = await query;
    return records.map(
      (r) =>
        new Plan(
          r.id,
          r.name,
          Number(r.price),
          r.description,
          r.isPopular,
          (r.targetRole as 'vendor' | 'client') || 'vendor',
          r.durationDays ?? 30,
        ),
    );
  }

  async findById(id: string): Promise<Plan | null> {
    const [record] = await this.db.select().from(plans).where(eq(plans.id, id)).limit(1);
    if (!record) {
      return null;
    }
    return new Plan(
      record.id,
      record.name,
      Number(record.price),
      record.description,
      record.isPopular,
      (record.targetRole as 'vendor' | 'client') || 'vendor',
      record.durationDays ?? 30,
    );
  }

  async create(plan: Plan): Promise<Plan> {
    await this.db.insert(plans).values({
      id: plan.id,
      name: plan.name,
      price: plan.price.toString(),
      description: plan.description,
      isPopular: plan.isPopular,
      targetRole: plan.targetRole,
      durationDays: plan.durationDays,
    });
    return plan;
  }

  async update(id: string, partial: Partial<Omit<Plan, 'id'>>): Promise<Plan> {
    const updatePayload: Record<string, unknown> = {};
    if (partial.name !== undefined) updatePayload.name = partial.name;
    if (partial.price !== undefined) updatePayload.price = partial.price.toString();
    if (partial.description !== undefined) updatePayload.description = partial.description;
    if (partial.isPopular !== undefined) updatePayload.isPopular = partial.isPopular;
    if (partial.targetRole !== undefined) updatePayload.targetRole = partial.targetRole;
    if (partial.durationDays !== undefined) updatePayload.durationDays = partial.durationDays;

    await this.db.update(plans).set(updatePayload).where(eq(plans.id, id));
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Plan con ID ${id} no encontrado`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(plans).where(eq(plans.id, id));
  }
}
