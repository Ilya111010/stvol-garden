import { Controller, Get, UseGuards } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { SimpleAuthGuard } from '../../guards/simple-auth.guard';
import { TelegramUser, TelegramUserData } from '../../decorators/telegram-user.decorator';

@Controller('balance')
@UseGuards(SimpleAuthGuard)
export class BalanceController {
  constructor(private balanceService: BalanceService) {}

  @Get()
  async getBalance(@TelegramUser() user: TelegramUserData) {
    return this.balanceService.getBalance(user.id.toString());
  }

  @Get('history')
  async getTransactionHistory(@TelegramUser() user: TelegramUserData) {
    const transactions = await this.balanceService.getTransactionHistory(user.id.toString());
    
    return transactions.map(t => ({
      id: t.id,
      amount: t.delta,
      type: t.kind,
      date: t.ts,
      metadata: t.meta_json
    }));
  }
}