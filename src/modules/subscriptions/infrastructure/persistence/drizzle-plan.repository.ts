import { Injectable, Inject } from '@nestjs/common';
import { IPlanRepository } from '../../domain/repositories/iplan.repository';
import { Plan } from '../../domain/entities/plan.entity';
import { DRIZZLE } from '../../../../database/database.module';
import { plans } from '../../../../database/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class DrizzlePlanRepository implements IPlanRepository {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async findAll(): Promise<Plan[]> {
    const records = await this.db.select().from(plans);
    return records.map((r) => new Plan(r.id, r.name, Number(r.price), r.description, r.isPopular));
  }
}
