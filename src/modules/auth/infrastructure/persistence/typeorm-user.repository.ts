import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from './entities/user.orm-entity';
import { IUserRepository } from '../../domain/repositories/iuser.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  private mapToDomain(ormEntity: UserOrmEntity): User {
    return new User(
      ormEntity.id,
      ormEntity.email,
      ormEntity.passwordHash,
      ormEntity.role,
      ormEntity.createdAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({ where: { email } });
    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  async save(user: User): Promise<User> {
    const ormEntity = this.userRepository.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
    });
    const saved = await this.userRepository.save(ormEntity);
    return this.mapToDomain(saved);
  }
}
