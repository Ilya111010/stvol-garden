import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PromoCodesService } from './promo-codes.service';
import { SimpleAuthGuard } from '../../guards/simple-auth.guard';
import { TelegramUser, TelegramUserData } from '../../decorators/telegram-user.decorator';
import { ActivatePromoCodeDto, CreatePromoCodeDto } from './dto/activate-promo-code.dto';

@Controller('promo-codes')
@UseGuards(SimpleAuthGuard)
export class PromoCodesController {
  constructor(private promoCodesService: PromoCodesService) {}

  @Post('activate')
  @UseGuards(ThrottlerGuard) // Rate limiting: 5 requests per minute
  async activatePromoCode(
    @Body() activateDto: ActivatePromoCodeDto,
    @TelegramUser() user: TelegramUserData,
  ) {
    return this.promoCodesService.activatePromoCode(
      activateDto.code,
      user.id.toString(),
    );
  }

  @Post('create')
  async createPromoCode(
    @Body() createDto: CreatePromoCodeDto,
    @TelegramUser() user: TelegramUserData,
  ) {
    // TODO: Add role-based authorization (staff/admin only)
    return this.promoCodesService.createPromoCode(
      createDto,
      user.id.toString(),
    );
  }

  @Get('history')
  async getActivationHistory(@TelegramUser() user: TelegramUserData) {
    return this.promoCodesService.getUserActivationHistory(user.id.toString());
  }
}