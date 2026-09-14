import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../../../database/database.module';
import {
  categories,
  devices,
  locations,
  products,
  promotions,
  sales,
  users,
} from '../../../../database/schema';

export interface AdminVendorProductItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryName: string | null;
}

export interface AdminVendorPromotionItem {
  id: string;
  title: string;
  description: string;
  discountPercent: number | null;
  promoPrice: number | null;
  isActive: boolean;
  validUntil: Date | null;
}

export interface AdminVendorSaleItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
}

export interface AdminVendorDetailResult {
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
  device: {
    id: string;
    name: string;
    batteryLevel: number | null;
    status: string;
    lastConnection: Date | null;
    currentLat: number | null;
    currentLng: number | null;
  } | null;
  categories: { id: string; name: string }[];
  products: AdminVendorProductItem[];
  promotions: AdminVendorPromotionItem[];
  recentSales: AdminVendorSaleItem[];
}

@Injectable()
export class GetAdminVendorDetailUseCase {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async execute(vendorId: string): Promise<AdminVendorDetailResult> {
    const [vendor] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, vendorId));

    if (!vendor) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    const vendorCategories = await this.db
      .select()
      .from(categories)
      .where(eq(categories.vendorId, vendorId));

    const categoryMap = new Map<string, string>();
    for (const cat of vendorCategories) {
      categoryMap.set(cat.id, cat.name);
    }

    const vendorProducts = await this.db
      .select()
      .from(products)
      .where(eq(products.vendorId, vendorId))
      .orderBy(desc(products.createdAt));

    const vendorPromotions = await this.db
      .select()
      .from(promotions)
      .where(eq(promotions.vendorId, vendorId))
      .orderBy(desc(promotions.createdAt));

    const vendorSales = await this.db
      .select()
      .from(sales)
      .where(eq(sales.vendorId, vendorId))
      .orderBy(desc(sales.createdAt))
      .limit(15);

    const [device] = await this.db
      .select()
      .from(devices)
      .where(eq(devices.userId, vendorId));

    let deviceInfo: AdminVendorDetailResult['device'] = null;

    if (device) {
      const [lastLocation] = await this.db
        .select()
        .from(locations)
        .where(eq(locations.deviceId, device.id))
        .orderBy(desc(locations.timestamp))
        .limit(1);

      deviceInfo = {
        id: device.id,
        name: device.name,
        batteryLevel: device.batteryLevel ? Number(device.batteryLevel) : null,
        status: device.status,
        lastConnection: device.lastConnection,
        currentLat: lastLocation?.latitude ? Number(lastLocation.latitude) : null,
        currentLng: lastLocation?.longitude ? Number(lastLocation.longitude) : null,
      };
    }

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
      device: deviceInfo,
      categories: vendorCategories.map((c) => ({ id: c.id, name: c.name })),
      products: vendorProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        imageUrl: p.imageUrl,
        isAvailable: p.isAvailable,
        categoryName: p.categoryId ? categoryMap.get(p.categoryId) ?? null : null,
      })),
      promotions: vendorPromotions.map((pr) => ({
        id: pr.id,
        title: pr.title,
        description: pr.description,
        discountPercent: pr.discountPercent ? Number(pr.discountPercent) : null,
        promoPrice: pr.promoPrice ? Number(pr.promoPrice) : null,
        isActive: pr.isActive,
        validUntil: pr.validUntil,
      })),
      recentSales: vendorSales.map((s) => ({
        id: s.id,
        productName: s.productName,
        quantity: Number(s.quantity),
        unitPrice: Number(s.unitPrice),
        totalAmount: Number(s.totalAmount),
        notes: s.notes,
        createdAt: s.createdAt,
      })),
    };
  }
}
