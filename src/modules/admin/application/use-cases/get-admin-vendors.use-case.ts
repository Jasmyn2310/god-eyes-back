import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../../../database/database.module';
import { products, sales, users } from '../../../../database/schema';

export interface AdminVendorListItem {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  vendorType: string | null;
  priceRange: string | null;
  phone: string | null;
  description: string | null;
  fixedAddress: string | null;
  fixedLatitude: number | null;
  fixedLongitude: number | null;
  role: string;
  createdAt: Date;
  totalProducts: number;
  totalSalesCount: number;
  totalRevenue: number;
}

@Injectable()
export class GetAdminVendorsUseCase {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async execute(): Promise<AdminVendorListItem[]> {
    const vendorUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.role, 'vendor'));

    const productCountsQuery = await this.db
      .select({
        vendorId: products.vendorId,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .groupBy(products.vendorId);

    const salesStatsQuery = await this.db
      .select({
        vendorId: sales.vendorId,
        salesCount: sql<number>`count(*)`,
        revenue: sql<string>`coalesce(sum(${sales.totalAmount}), 0)`,
      })
      .from(sales)
      .groupBy(sales.vendorId);

    const productCountMap = new Map<string, number>();
    for (const item of productCountsQuery) {
      productCountMap.set(item.vendorId, Number(item.count));
    }

    const salesStatsMap = new Map<string, { count: number; revenue: number }>();
    for (const item of salesStatsQuery) {
      salesStatsMap.set(item.vendorId, {
        count: Number(item.salesCount),
        revenue: Number(item.revenue),
      });
    }

    return vendorUsers.map((vendor) => {
      const stats = salesStatsMap.get(vendor.id) || { count: 0, revenue: 0 };
      return {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        photoUrl: vendor.photoUrl,
        vendorType: vendor.vendorType,
        priceRange: vendor.priceRange,
        phone: vendor.phone,
        description: vendor.description,
        fixedAddress: vendor.fixedAddress,
        fixedLatitude: vendor.fixedLatitude ? Number(vendor.fixedLatitude) : null,
        fixedLongitude: vendor.fixedLongitude ? Number(vendor.fixedLongitude) : null,
        role: vendor.role,
        createdAt: vendor.createdAt,
        totalProducts: productCountMap.get(vendor.id) || 0,
        totalSalesCount: stats.count,
        totalRevenue: stats.revenue,
      };
    });
  }
}
