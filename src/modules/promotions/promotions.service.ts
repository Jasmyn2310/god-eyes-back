import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { v4 as uuidv4 } from 'uuid';
import { DRIZZLE } from '../../database/database.module';
import { promotions } from '../../database/schema';
import { CreatePromotionDto } from './dtos/create-promotion.dto';
import { UpdatePromotionDto } from './dtos/update-promotion.dto';

export interface PromotionResult {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  discountPercent: number | null;
  promoPrice: number | null;
  isActive: boolean;
  validUntil: Date | null;
  createdAt: Date;
}

@Injectable()
export class PromotionsService {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async getPromotions(vendorId: string): Promise<PromotionResult[]> {
    if (!vendorId) return [];

    const list = await this.db
      .select()
      .from(promotions)
      .where(eq(promotions.vendorId, vendorId))
      .orderBy(desc(promotions.createdAt));

    return list.map((p) => ({
      id: p.id,
      vendorId: p.vendorId,
      title: p.title,
      description: p.description,
      discountPercent: p.discountPercent ? Number(p.discountPercent) : null,
      promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
      isActive: p.isActive,
      validUntil: p.validUntil,
      createdAt: p.createdAt,
    }));
  }

  async createPromotion(vendorId: string, dto: CreatePromotionDto): Promise<PromotionResult> {
    if (!vendorId) throw new NotFoundException('Vendedor no especificado');

    const id = uuidv4();
    const [created] = await this.db
      .insert(promotions)
      .values({
        id,
        vendorId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        discountPercent: dto.discountPercent ? dto.discountPercent.toString() : null,
        promoPrice: dto.promoPrice ? dto.promoPrice.toString() : null,
        isActive: dto.isActive ?? true,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      })
      .returning();

    return {
      id: created.id,
      vendorId: created.vendorId,
      title: created.title,
      description: created.description,
      discountPercent: created.discountPercent ? Number(created.discountPercent) : null,
      promoPrice: created.promoPrice ? Number(created.promoPrice) : null,
      isActive: created.isActive,
      validUntil: created.validUntil,
      createdAt: created.createdAt,
    };
  }

  async updatePromotion(
    vendorId: string,
    promoId: string,
    dto: UpdatePromotionDto,
  ): Promise<PromotionResult> {
    const [existing] = await this.db
      .select()
      .from(promotions)
      .where(and(eq(promotions.id, promoId), eq(promotions.vendorId, vendorId)));

    if (!existing) {
      throw new NotFoundException('Promoción no encontrada');
    }

    const updateData: Partial<typeof promotions.$inferInsert> = {};
    if (dto.title !== undefined) updateData.title = dto.title.trim();
    if (dto.description !== undefined) updateData.description = dto.description.trim();
    if (dto.discountPercent !== undefined) updateData.discountPercent = dto.discountPercent.toString();
    if (dto.promoPrice !== undefined) updateData.promoPrice = dto.promoPrice.toString();
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.validUntil !== undefined) updateData.validUntil = dto.validUntil ? new Date(dto.validUntil) : null;

    const [updated] = await this.db
      .update(promotions)
      .set(updateData)
      .where(and(eq(promotions.id, promoId), eq(promotions.vendorId, vendorId)))
      .returning();

    return {
      id: updated.id,
      vendorId: updated.vendorId,
      title: updated.title,
      description: updated.description,
      discountPercent: updated.discountPercent ? Number(updated.discountPercent) : null,
      promoPrice: updated.promoPrice ? Number(updated.promoPrice) : null,
      isActive: updated.isActive,
      validUntil: updated.validUntil,
      createdAt: updated.createdAt,
    };
  }

  async deletePromotion(vendorId: string, promoId: string): Promise<void> {
    const result = await this.db
      .delete(promotions)
      .where(and(eq(promotions.id, promoId), eq(promotions.vendorId, vendorId)));

    if (result.count === 0) {
      throw new NotFoundException('Promoción no encontrada');
    }
  }
}
