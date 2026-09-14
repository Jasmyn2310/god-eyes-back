import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/database.module';
import {
  categories,
  devices,
  locations,
  products,
  promotions,
  users,
} from '../../database/schema';

export interface VendorLocationResult {
  id: string;
  name: string | null;
  photoUrl: string | null;
  type: string | null;
  priceRange: string | null;
  phone: string | null;
  description: string | null;
  fixedAddress: string | null;
  lat: number;
  lng: number;
  locationType: 'realtime' | 'fixed';
  isLive: boolean;
}

export interface VendorDetailResult {
  id: string;
  name: string | null;
  photoUrl: string | null;
  type: string | null;
  priceRange: string | null;
  phone: string | null;
  description: string | null;
  fixedAddress: string | null;
  fixedLatitude: number | null;
  fixedLongitude: number | null;
  currentLat: number | null;
  currentLng: number | null;
  locationType: 'realtime' | 'fixed' | 'none';
  isLive: boolean;
  categories: { id: string; name: string }[];
  products: {
    id: string;
    categoryId: string | null;
    categoryName: string | null;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
  }[];
  promotions: {
    id: string;
    title: string;
    description: string;
    discountPercent: number | null;
    promoPrice: number | null;
    isActive: boolean;
    validUntil: Date | null;
  }[];
}

interface VendorRealtimeRow extends Record<string, unknown> {
  vendor_id: string;
  lat: string;
  lng: string;
  timestamp: Date;
}

@Injectable()
export class VendorsService {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async getAllVendors(): Promise<VendorLocationResult[]> {
    const vendorUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.role, 'vendor'));

    const realtimeQuery = sql<VendorRealtimeRow>`
      SELECT DISTINCT ON (${devices.userId})
        ${devices.userId} AS vendor_id,
        ${locations.latitude} AS lat,
        ${locations.longitude} AS lng,
        ${locations.timestamp} AS timestamp
      FROM ${devices}
      INNER JOIN ${locations} ON ${locations.deviceId} = ${devices.id}
      ORDER BY ${devices.userId}, ${locations.timestamp} DESC
    `;

    const realtimeRows = await this.db.execute<VendorRealtimeRow>(realtimeQuery);
    const realtimeMap = new Map<string, VendorRealtimeRow>();

    for (const row of Array.from(realtimeRows)) {
      realtimeMap.set(row.vendor_id, row);
    }

    const results: VendorLocationResult[] = [];
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    for (const vendor of vendorUsers) {
      const realtime = realtimeMap.get(vendor.id);
      const isLiveRecently =
        realtime && new Date(realtime.timestamp).getTime() > fifteenMinutesAgo.getTime();

      if (isLiveRecently && realtime) {
        results.push({
          id: vendor.id,
          name: vendor.name,
          photoUrl: vendor.photoUrl,
          type: vendor.vendorType,
          priceRange: vendor.priceRange,
          phone: vendor.phone,
          description: vendor.description,
          fixedAddress: vendor.fixedAddress,
          lat: Number(realtime.lat),
          lng: Number(realtime.lng),
          locationType: 'realtime',
          isLive: true,
        });
      } else if (vendor.fixedLatitude && vendor.fixedLongitude) {
        results.push({
          id: vendor.id,
          name: vendor.name,
          photoUrl: vendor.photoUrl,
          type: vendor.vendorType,
          priceRange: vendor.priceRange,
          phone: vendor.phone,
          description: vendor.description,
          fixedAddress: vendor.fixedAddress,
          lat: Number(vendor.fixedLatitude),
          lng: Number(vendor.fixedLongitude),
          locationType: 'fixed',
          isLive: false,
        });
      } else if (realtime) {
        results.push({
          id: vendor.id,
          name: vendor.name,
          photoUrl: vendor.photoUrl,
          type: vendor.vendorType,
          priceRange: vendor.priceRange,
          phone: vendor.phone,
          description: vendor.description,
          fixedAddress: vendor.fixedAddress,
          lat: Number(realtime.lat),
          lng: Number(realtime.lng),
          locationType: 'realtime',
          isLive: false,
        });
      }
    }

    return results;
  }

  async getVendorDetail(vendorId: string): Promise<VendorDetailResult> {
    const [vendor] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, vendorId), eq(users.role, 'vendor')));

    if (!vendor) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    const realtimeQuery = sql<VendorRealtimeRow>`
      SELECT DISTINCT ON (${devices.userId})
        ${devices.userId} AS vendor_id,
        ${locations.latitude} AS lat,
        ${locations.longitude} AS lng,
        ${locations.timestamp} AS timestamp
      FROM ${devices}
      INNER JOIN ${locations} ON ${locations.deviceId} = ${devices.id}
      WHERE ${devices.userId} = ${vendorId}
      ORDER BY ${devices.userId}, ${locations.timestamp} DESC
    `;

    const realtimeRows = await this.db.execute<VendorRealtimeRow>(realtimeQuery);
    const realtimeRecord = Array.from(realtimeRows)[0];

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const isLive =
      Boolean(realtimeRecord) &&
      new Date(realtimeRecord.timestamp).getTime() > fifteenMinutesAgo.getTime();

    let currentLat: number | null = null;
    let currentLng: number | null = null;
    let locationType: 'realtime' | 'fixed' | 'none' = 'none';

    if (isLive && realtimeRecord) {
      currentLat = Number(realtimeRecord.lat);
      currentLng = Number(realtimeRecord.lng);
      locationType = 'realtime';
    } else if (vendor.fixedLatitude && vendor.fixedLongitude) {
      currentLat = Number(vendor.fixedLatitude);
      currentLng = Number(vendor.fixedLongitude);
      locationType = 'fixed';
    } else if (realtimeRecord) {
      currentLat = Number(realtimeRecord.lat);
      currentLng = Number(realtimeRecord.lng);
      locationType = 'realtime';
    }

    const vendorCategories = await this.db
      .select()
      .from(categories)
      .where(eq(categories.vendorId, vendorId))
      .orderBy(categories.name);

    const vendorProducts = await this.db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.vendorId, vendorId), eq(products.isAvailable, true)))
      .orderBy(desc(products.createdAt));

    const vendorPromotions = await this.db
      .select()
      .from(promotions)
      .where(and(eq(promotions.vendorId, vendorId), eq(promotions.isActive, true)))
      .orderBy(desc(promotions.createdAt));

    return {
      id: vendor.id,
      name: vendor.name,
      photoUrl: vendor.photoUrl,
      type: vendor.vendorType,
      priceRange: vendor.priceRange,
      phone: vendor.phone,
      description: vendor.description,
      fixedAddress: vendor.fixedAddress,
      fixedLatitude: vendor.fixedLatitude ? Number(vendor.fixedLatitude) : null,
      fixedLongitude: vendor.fixedLongitude ? Number(vendor.fixedLongitude) : null,
      currentLat,
      currentLng,
      locationType,
      isLive,
      categories: vendorCategories.map((c) => ({ id: c.id, name: c.name })),
      products: vendorProducts.map((p) => ({
        id: p.product.id,
        categoryId: p.product.categoryId,
        categoryName: p.category ? p.category.name : null,
        name: p.product.name,
        description: p.product.description,
        price: Number(p.product.price),
        imageUrl: p.product.imageUrl,
        isAvailable: p.product.isAvailable,
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
    };
  }
}
