import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export const TelegramUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): TelegramUserData => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.telegramUser;

    return data ? user?.[data] : user;
  },
);

export const StartParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.startParam;
  },
);