import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/iuser.repository';
import { User } from '../../domain/entities/user.entity';
import { DRIZZLE } from '../../../../database/database.module';
import { users } from '../../../../database/schema';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  async findByEmail(email: string): Promise<User | null> {
    const [record] = await this.db.select().from(users).where(eq(users.email, email));
    if (!record) return null;
    return new User(
      record.id,
      record.email,
      record.passwordHash,
      record.role,
      record.createdAt,
      record.name,
    );
  }

  async save(user: User): Promise<User> {
    await this.db.insert(users).values({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      name: user.name ?? null,
      createdAt: user.createdAt,
    });
    return user;
  }
}
