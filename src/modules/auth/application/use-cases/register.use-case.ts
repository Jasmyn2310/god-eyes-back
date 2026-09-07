import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/iuser.repository';
import { RegisterDto } from '../dtos/register.dto';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El usuario con este correo ya existe');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(dto.password, salt);

    const user = new User(
      crypto.randomUUID(),
      dto.email,
      hash,
      'vendor',
      new Date(),
      dto.name ?? null,
    );

    return this.userRepository.save(user);
  }
}
