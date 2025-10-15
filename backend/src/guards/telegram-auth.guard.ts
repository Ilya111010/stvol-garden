import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramAuth } from '../utils/crypto.utils';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('tma ')) {
      throw new UnauthorizedException('Missing Telegram Mini App authentication');
    }

    const initData = authHeader.substring(4); // Remove 'tma ' prefix
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      throw new UnauthorizedException('Bot token not configured');
    }

    const validation = TelegramAuth.validateInitData(initData, botToken);

    if (!validation.is_valid) {
      throw new UnauthorizedException(`Invalid Telegram authentication: ${validation.error}`);
    }

    // Add user data to request
    request.telegramUser = validation.user;
    request.startParam = validation.start_param;

    return true;
  }
}