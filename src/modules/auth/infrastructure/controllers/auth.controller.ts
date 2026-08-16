import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RegisterDto } from '../../application/dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.registerUseCase.execute(registerDto);
    return {
      message: 'Usuario registrado con éxito',
      id: user.id,
      email: user.email,
    };
  }
}
