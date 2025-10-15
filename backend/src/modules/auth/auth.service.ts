import { Injectable } from '@nestjs/common';
import { ReferralService } from '../referral/referral.service';

@Injectable()
export class AuthService {
  constructor(private referralService: ReferralService) {}

  async processUserInit(tgId: string, startParam?: string): Promise<{
    is_new_user: boolean;
    referral_processed?: boolean;
    welcome_message?: string;
  }> {
    let isNewUser = false;
    let referralProcessed = false;
    let welcomeMessage = '';

    // Check if this is a referral
    if (startParam && startParam.startsWith('ref_')) {
      const inviterTgId = startParam.substring(4);
      
      try {
        await this.referralService.processReferral(tgId, inviterTgId);
        referralProcessed = true;
        isNewUser = true;
        welcomeMessage = '🎉 Добро пожаловать в Stvol Garden! Вы пришли по приглашению друга. Сделайте первую покупку от 2000₽ и получите +6 лепестков!';
      } catch (error) {
        // Referral processing failed, but user can still use the app
        console.log('Referral processing failed:', error.message);
      }
    }

    if (!referralProcessed && !welcomeMessage) {
      welcomeMessage = '🌸 Добро пожаловать в Stvol Garden! Активируйте промокод с чека или пригласите друзей для получения бонусов.';
    }

    return {
      is_new_user: isNewUser,
      referral_processed: referralProcessed,
      welcome_message: welcomeMessage
    };
  }
}