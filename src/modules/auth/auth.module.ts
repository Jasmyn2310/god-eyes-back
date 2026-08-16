import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { RegisterUseCase } from './application/use-cases/register.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    {
      provide: 'IUserRepository',
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class AuthModule {}
