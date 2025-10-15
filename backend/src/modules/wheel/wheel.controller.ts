import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { WheelService } from './wheel.service';
import { SimpleAuthGuard } from '../../guards/simple-auth.guard';
import { TelegramUser, TelegramUserData } from '../../decorators/telegram-user.decorator';

@Controller('wheel')
@UseGuards(SimpleAuthGuard)
export class WheelController {
  constructor(private wheelService: WheelService) {}

  @Get('config')
  async getWheelConfiguration() {
    return this.wheelService.getWheelConfiguration();
  }

  @Post('spin')
  async spinWheel(@TelegramUser() user: TelegramUserData) {
    return this.wheelService.spinWheel(user.id.toString());
  }
}