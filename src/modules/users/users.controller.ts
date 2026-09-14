import { Body, Controller, Get, Put, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UsersService } from './users.service';

interface AuthenticatedUser {
  id?: string;
  userId?: string;
  email: string;
  role: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const targetId = user?.id || user?.userId;
    if (!targetId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.getProfile(targetId);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const targetId = user.id || user.userId;
    if (!targetId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.updateProfile(targetId, dto);
  }
}
