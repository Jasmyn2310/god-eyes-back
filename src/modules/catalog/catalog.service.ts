import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { v4 as uuidv4 } from 'uuid';
import { DRIZZLE } from '../../database/database.module';
import { categories, products } from '../../database/schema';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

export interface CategoryResult {
  id: string;
  vendorId: string;
  name: string;
  createdAt: Date;
}

export interface ProductResult {
  id: string;
  vendorId: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: Date;
}

@Injectable()
export class CatalogService {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async getCategories(vendorId: string): Promise<CategoryResult[]> {
    if (!vendorId) return [];

    const list = await this.db
      .select()
      .from(categories)
      .where(eq(categories.vendorId, vendorId))
      .orderBy(categories.name);

    return list.map((c) => ({
      id: c.id,
      vendorId: c.vendorId,
      name: c.name,
      createdAt: c.createdAt,
    }));
  }

  async createCategory(vendorId: string, dto: CreateCategoryDto): Promise<CategoryResult> {
    if (!vendorId) throw new NotFoundException('Vendedor no especificado');

    const id = uuidv4();
    const [created] = await this.db
      .insert(categories)
      .values({
        id,
        vendorId,
        name: dto.name.trim(),
      })
      .returning();

    return {
      id: created.id,
      vendorId: created.vendorId,
      name: created.name,
      createdAt: created.createdAt,
    };
  }

  async deleteCategory(vendorId: string, categoryId: string): Promise<void> {
    if (!vendorId || !categoryId) throw new NotFoundException('Categoría no encontrada');

    const result = await this.db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.vendorId, vendorId)));

    if (result.count === 0) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }

  async getProducts(vendorId: string): Promise<ProductResult[]> {
    if (!vendorId) return [];

    const rows = await this.db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.vendorId, vendorId))
      .orderBy(desc(products.createdAt));

    return rows.map((r) => ({
      id: r.product.id,
      vendorId: r.product.vendorId,
      categoryId: r.product.categoryId,
      categoryName: r.category ? r.category.name : null,
      name: r.product.name,
      description: r.product.description,
      price: Number(r.product.price),
      imageUrl: r.product.imageUrl,
      isAvailable: r.product.isAvailable,
      createdAt: r.product.createdAt,
    }));
  }

  async createProduct(vendorId: string, dto: CreateProductDto): Promise<ProductResult> {
    const id = uuidv4();
    const [created] = await this.db
      .insert(products)
      .values({
        id,
        vendorId,
        categoryId: dto.categoryId ?? null,
        name: dto.name.trim(),
        description: dto.description ?? null,
        price: dto.price.toString(),
        imageUrl: dto.imageUrl ?? null,
        isAvailable: dto.isAvailable ?? true,
      })
      .returning();

    let categoryName: string | null = null;
    if (created.categoryId) {
      const [cat] = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, created.categoryId));
      if (cat) categoryName = cat.name;
    }

    return {
      id: created.id,
      vendorId: created.vendorId,
      categoryId: created.categoryId,
      categoryName,
      name: created.name,
      description: created.description,
      price: Number(created.price),
      imageUrl: created.imageUrl,
      isAvailable: created.isAvailable,
      createdAt: created.createdAt,
    };
  }

  async updateProduct(
    vendorId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductResult> {
    const [existing] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)));

    if (!existing) {
      throw new NotFoundException('Producto no encontrado');
    }

    const updateData: Partial<typeof products.$inferInsert> = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price.toString();
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.isAvailable !== undefined) updateData.isAvailable = dto.isAvailable;

    await this.db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)));

    const [updated] = await this.db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, productId));

    return {
      id: updated.product.id,
      vendorId: updated.product.vendorId,
      categoryId: updated.product.categoryId,
      categoryName: updated.category ? updated.category.name : null,
      name: updated.product.name,
      description: updated.product.description,
      price: Number(updated.product.price),
      imageUrl: updated.product.imageUrl,
      isAvailable: updated.product.isAvailable,
      createdAt: updated.product.createdAt,
    };
  }

  async deleteProduct(vendorId: string, productId: string): Promise<void> {
    const result = await this.db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)));

    if (result.count === 0) {
      throw new NotFoundException('Producto no encontrado');
    }
  }
}
