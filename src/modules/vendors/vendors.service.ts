import { Injectable } from '@nestjs/common';
import { db } from '../../database/database.module';
import { users, locations, devices } from '../../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class VendorsService {
  async getAllVendors() {
    // Get all vendors with their latest location
    // Since this is a simple query, we'll fetch users that are vendors and join with devices and locations
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        photoUrl: users.photoUrl,
        type: users.vendorType,
        priceRange: users.priceRange,
        lat: locations.latitude,
        lng: locations.longitude,
      })
      .from(users)
      .innerJoin(devices, eq(devices.userId, users.id))
      .innerJoin(locations, eq(locations.deviceId, devices.id))
      .where(eq(users.role, 'vendor'));

    return result.map((row) => ({
      ...row,
      lat: Number(row.lat),
      lng: Number(row.lng),
    }));
  }
}
