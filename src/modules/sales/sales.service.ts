import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { v4 as uuidv4 } from 'uuid';
import { DRIZZLE } from '../../database/database.module';
import { sales } from '../../database/schema';
import { RecordSaleDto } from './dtos/record-sale.dto';

export interface SaleResult {
  id: string;
  vendorId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
}

export interface SalesSummaryResult {
  todayTotal: number;
  todayCount: number;
  weekTotal: number;
  monthTotal: number;
  averageTicket: number;
}

@Injectable()
export class SalesService {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async recordSale(vendorId: string, dto: RecordSaleDto): Promise<SaleResult> {
    const id = uuidv4();
    const [created] = await this.db
      .insert(sales)
      .values({
        id,
        vendorId,
        productId: dto.productId ?? null,
        productName: dto.productName.trim(),
        quantity: dto.quantity.toString(),
        unitPrice: dto.unitPrice.toString(),
        totalAmount: dto.totalAmount.toString(),
        notes: dto.notes ? dto.notes.trim() : null,
      })
      .returning();

    return {
      id: created.id,
      vendorId: created.vendorId,
      productId: created.productId,
      productName: created.productName,
      quantity: Number(created.quantity),
      unitPrice: Number(created.unitPrice),
      totalAmount: Number(created.totalAmount),
      notes: created.notes,
      createdAt: created.createdAt,
    };
  }

  async getSales(vendorId: string, limit = 50): Promise<SaleResult[]> {
    if (!vendorId) return [];

    const list = await this.db
      .select()
      .from(sales)
      .where(eq(sales.vendorId, vendorId))
      .orderBy(desc(sales.createdAt))
      .limit(limit);

    return list.map((s) => ({
      id: s.id,
      vendorId: s.vendorId,
      productId: s.productId,
      productName: s.productName,
      quantity: Number(s.quantity),
      unitPrice: Number(s.unitPrice),
      totalAmount: Number(s.totalAmount),
      notes: s.notes,
      createdAt: s.createdAt,
    }));
  }

  async getSummary(vendorId: string): Promise<SalesSummaryResult> {
    if (!vendorId) {
      return {
        todayTotal: 0,
        todayCount: 0,
        weekTotal: 0,
        monthTotal: 0,
        averageTicket: 0,
      };
    }

    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const currentDayOfWeek = now.getDay();
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaySales = await this.db
      .select()
      .from(sales)
      .where(and(eq(sales.vendorId, vendorId), gte(sales.createdAt, startOfToday)));

    const weekSales = await this.db
      .select()
      .from(sales)
      .where(and(eq(sales.vendorId, vendorId), gte(sales.createdAt, startOfWeek)));

    const monthSales = await this.db
      .select()
      .from(sales)
      .where(and(eq(sales.vendorId, vendorId), gte(sales.createdAt, startOfMonth)));

    const todayTotal = todaySales.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    const todayCount = todaySales.length;
    const weekTotal = weekSales.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    const monthTotal = monthSales.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    const averageTicket = todayCount > 0 ? todayTotal / todayCount : 0;

    return {
      todayTotal: Number(todayTotal.toFixed(2)),
      todayCount,
      weekTotal: Number(weekTotal.toFixed(2)),
      monthTotal: Number(monthTotal.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2)),
    };
  }
}
