import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/iuser.repository';
import { RegisterDto } from '../dtos/register.dto';
import { User } from '../../domain/entities/user.entity';

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

    // Aquí iría el hashing real (ej. bcrypt), se deja el mapeo directo para esta estructura inicial
    const user = new User(
      crypto.randomUUID(), 
      dto.email,
      dto.password, 
      'vendor',
      new Date(),
    );

    return this.userRepository.save(user);
  }
}
