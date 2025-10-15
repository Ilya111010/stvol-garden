import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SimpleAuthGuard } from '../../guards/simple-auth.guard';
import { TelegramUser, TelegramUserData, StartParam } from '../../decorators/telegram-user.decorator';
import { IsOptional, IsString } from 'class-validator';

class InitUserDto {
  @IsOptional()
  @IsString()
  start_param?: string;
}

@Controller('auth')
@UseGuards(SimpleAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('init')
  async initUser(
    @TelegramUser() user: TelegramUserData,
    @StartParam() startParam?: string,
    @Body() initDto?: InitUserDto
  ) {
    // Use start param from decorator or body
    const param = startParam || initDto?.start_param;
    
    const initResult = await this.authService.processUserInit(
      user.id.toString(),
      param
    );

    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      },
      ...initResult
    };
  }
}