import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { SimpleAuthGuard } from '../../guards/simple-auth.guard';
import { TelegramUser, TelegramUserData } from '../../decorators/telegram-user.decorator';

@Controller('social')
@UseGuards(SimpleAuthGuard)
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Get('instructions')
  async getSocialInstructions() {
    return this.socialService.getSocialInstructions();
  }

  @Get('eligibility')
  async checkEligibility(@TelegramUser() user: TelegramUserData) {
    return this.socialService.checkSocialActivityEligibility(user.id.toString());
  }

  @Get('stats')
  async getStats(@TelegramUser() user: TelegramUserData) {
    return this.socialService.getSocialActivityStats(user.id.toString());
  }

  @Post('generate-promo')
  async generateSocialPromo(
    @TelegramUser() user: TelegramUserData,
    @Query('type') activityType: 'story' | 'post' | 'mention' = 'story'
  ) {
    // TODO: Add role check for staff/admin only
    return this.socialService.generateSocialActivityPromo(
      user.id.toString(),
      activityType
    );
  }
}