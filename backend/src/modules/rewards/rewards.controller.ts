import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { SimpleAuthGuard } from '../../guards/simple-auth.guard';
import { TelegramUser, TelegramUserData } from '../../decorators/telegram-user.decorator';
import { IsString, IsNotEmpty } from 'class-validator';

class ExchangeRewardDto {
  @IsString()
  @IsNotEmpty()
  reward_id: string;
}

@Controller('rewards')
@UseGuards(SimpleAuthGuard)
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('list')
  async getAvailableRewards() {
    return this.rewardsService.getAvailableRewards();
  }

  @Post('exchange')
  async exchangeReward(
    @Body() exchangeDto: ExchangeRewardDto,
    @TelegramUser() user: TelegramUserData
  ) {
    return this.rewardsService.exchangeReward(
      user.id.toString(),
      exchangeDto.reward_id
    );
  }

  @Get('history')
  async getRewardHistory(@TelegramUser() user: TelegramUserData) {
    return this.rewardsService.getUserRewardHistory(user.id.toString());
  }
}