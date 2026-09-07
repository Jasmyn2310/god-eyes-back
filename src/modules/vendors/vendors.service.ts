import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/database.module';
import { devices, locations, users } from '../../database/schema';

export interface VendorLocationResult {
  id: string;
  name: string | null;
  photoUrl: string | null;
  type: string | null;
  priceRange: string | null;
  lat: number;
  lng: number;
}

interface VendorLocationQueryRow extends Record<string, unknown> {
  id: string;
  name: string | null;
  photo_url: string | null;
  vendor_type: string | null;
  price_range: string | null;
  lat: string;
  lng: string;
}

@Injectable()
export class VendorsService {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async getAllVendors(): Promise<VendorLocationResult[]> {
    const query = sql<VendorLocationQueryRow>`
      SELECT DISTINCT ON (${devices.id})
        ${users.id} AS id,
        ${users.name} AS name,
        ${users.photoUrl} AS photo_url,
        ${users.vendorType} AS vendor_type,
        ${users.priceRange} AS price_range,
        ${locations.latitude} AS lat,
        ${locations.longitude} AS lng
      FROM ${users}
      INNER JOIN ${devices} ON ${devices.userId} = ${users.id}
      INNER JOIN ${locations} ON ${locations.deviceId} = ${devices.id}
      WHERE ${users.role} = 'vendor'
      ORDER BY ${devices.id}, ${locations.timestamp} DESC
    `;

    const records = await this.db.execute<VendorLocationQueryRow>(query);

    return Array.from(records).map((record) => ({
      id: record.id,
      name: record.name,
      photoUrl: record.photo_url,
      type: record.vendor_type,
      priceRange: record.price_range,
      lat: Number(record.lat),
      lng: Number(record.lng),
    }));
  }
}
