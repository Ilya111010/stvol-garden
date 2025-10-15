import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SimpleAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // For demo purposes, allow requests without auth header
    if (!authHeader) {
      // Create a demo user
      request.telegramUser = {
        id: 123456789,
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo_user',
        language_code: 'ru'
      };
      request.startParam = null;
      return true;
    }

    if (!authHeader.startsWith('tma ')) {
      throw new UnauthorizedException('Missing Telegram Mini App authentication');
    }

    const initData = authHeader.substring(4);
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      // For demo, just parse the initData as JSON
      try {
        const userData = JSON.parse(initData);
        request.telegramUser = userData;
        request.startParam = null;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid authentication data');
      }
    }

    // In production, validate with Telegram
    // For demo, just accept the data
    try {
      const userData = JSON.parse(initData);
      request.telegramUser = userData;
      request.startParam = null;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication data');
    }
  }
}

