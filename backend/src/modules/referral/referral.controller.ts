import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { SimpleAuthGuard } from '../../guards/simple-auth.guard';
import { TelegramUser, TelegramUserData } from '../../decorators/telegram-user.decorator';
import { ConfirmOrderDto } from './dto/referral.dto';

@Controller('referral')
@UseGuards(SimpleAuthGuard)
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('stats')
  async getReferralStats(@TelegramUser() user: TelegramUserData) {
    return this.referralService.getReferralStats(user.id.toString());
  }

  @Get('list')
  async getReferralList(@TelegramUser() user: TelegramUserData) {
    return this.referralService.getReferralList(user.id.toString());
  }

  @Get('link')
  async getReferralLink(@TelegramUser() user: TelegramUserData) {
    const link = this.referralService.generateReferralLink(user.id.toString());
    return { referral_link: link };
  }

  @Post('confirm-order')
  async confirmFirstOrder(
    @Body() confirmOrderDto: ConfirmOrderDto,
    @TelegramUser() user: TelegramUserData
  ) {
    return this.referralService.confirmFirstOrder(
      user.id.toString(),
      confirmOrderDto
    );
  }
}