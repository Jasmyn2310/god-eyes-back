import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../../../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { users, devices, alerts } from '../../../../database/schema';
import { sql } from 'drizzle-orm';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async execute() {
    const [userCount] = await this.db.select({ count: sql<number>`count(*)` }).from(users);
    const [deviceCount] = await this.db.select({ count: sql<number>`count(*)` }).from(devices);
    const [alertCount] = await this.db.select({ count: sql<number>`count(*)` }).from(alerts);

    // Ingresos mock por ahora, se puede calcular sumando de la tabla suscripciones luego.
    return {
      activeVendors: Number(userCount.count),
      registeredDevices: Number(deviceCount.count),
      monthlyRevenue: 4250, 
    };
  }
}
