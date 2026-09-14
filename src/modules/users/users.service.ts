import { Inject, Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/database.module';
import { users } from '../../database/schema';
import { UpdateProfileDto } from './dtos/update-profile.dto';

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  vendorType: string | null;
  priceRange: string | null;
  phone: string | null;
  description: string | null;
  fixedLatitude: number | null;
  fixedLongitude: number | null;
  fixedAddress: string | null;
  role: string;
  createdAt: Date;
}

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const existingClient = await this.db
        .select()
        .from(users)
        .where(eq(users.email, 'cliente@godeyes.com'));

      if (existingClient.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('cliente123', salt);
        await this.db.insert(users).values({
          id: crypto.randomUUID(),
          email: 'cliente@godeyes.com',
          passwordHash,
          name: 'Cliente GodEyes',
          photoUrl: 'https://ui-avatars.com/api/?name=Cliente+GodEyes&background=10B981&color=fff&size=150',
          role: 'client',
        });
      }
    } catch {}
  }

  async getProfile(userId: string): Promise<UserProfileResponse> {
    if (!userId) {
      throw new NotFoundException('Usuario no especificado');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photoUrl: user.photoUrl,
      vendorType: user.vendorType,
      priceRange: user.priceRange,
      phone: user.phone,
      description: user.description,
      fixedLatitude: user.fixedLatitude ? Number(user.fixedLatitude) : null,
      fixedLongitude: user.fixedLongitude ? Number(user.fixedLongitude) : null,
      fixedAddress: user.fixedAddress,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileResponse> {
    if (!userId) {
      throw new NotFoundException('Usuario no especificado');
    }

    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updateData: Partial<typeof users.$inferInsert> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.photoUrl !== undefined) updateData.photoUrl = dto.photoUrl;
    if (dto.vendorType !== undefined) updateData.vendorType = dto.vendorType;
    if (dto.priceRange !== undefined) updateData.priceRange = dto.priceRange;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.fixedLatitude !== undefined) updateData.fixedLatitude = dto.fixedLatitude.toString();
    if (dto.fixedLongitude !== undefined) updateData.fixedLongitude = dto.fixedLongitude.toString();
    if (dto.fixedAddress !== undefined) updateData.fixedAddress = dto.fixedAddress;

    await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return this.getProfile(userId);
  }
}
