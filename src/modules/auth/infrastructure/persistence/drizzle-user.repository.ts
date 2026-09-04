import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/iuser.repository';
import { User } from '../../domain/entities/user.entity';
import { DRIZZLE } from '../../../../database/database.module';
import { users } from '../../../../database/schema';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DrizzleUserRepository implements IUserRepository, OnModuleInit {
  private readonly logger = new Logger(DrizzleUserRepository.name);

  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async onModuleInit() {
    const adminEmail = 'admin@godeyes.com';
    const admin = await this.findByEmail(adminEmail);
    if (!admin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const newAdmin = new User(uuidv4(), adminEmail, passwordHash, 'ADMIN', new Date());
      await this.save(newAdmin);
      this.logger.log(`Admin user seeded: ${adminEmail}`);
    } else {
      this.logger.log(`Admin user already exists: ${adminEmail}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const [record] = await this.db.select().from(users).where(eq(users.email, email));
    if (!record) return null;
    return new User(record.id, record.email, record.passwordHash, record.role, record.createdAt);
  }

  async save(user: User): Promise<User> {
    await this.db.insert(users).values({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
    });
    return user;
  }
}
