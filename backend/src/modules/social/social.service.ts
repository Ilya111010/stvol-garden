import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode, PromoCodeType } from '../../entities/promo-code.entity';
import { Transaction, TransactionKind } from '../../entities/transaction.entity';
import { PromoCodeGenerator } from '../../utils/crypto.utils';
import { QRCodeGenerator } from '../../utils/qr.utils';

export interface SocialActivityPromoDto {
  code: string;
  qr_code: string;
  expires_at: Date;
  petals_reward: number;
  message: string;
}

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async generateSocialActivityPromo(
    createdByTgId: string,
    activityType: 'story' | 'post' | 'mention' = 'story'
  ): Promise<SocialActivityPromoDto> {
    const PETALS_REWARD = 5;
    const EXPIRES_IN_DAYS = 14;

    // Generate promo code with SOCIAL prefix
    const { code, checksum } = PromoCodeGenerator.generate('SC', 10);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + EXPIRES_IN_DAYS);

    // Create promo code
    const promoCode = this.promoCodeRepository.create({
      code,
      type: PromoCodeType.SOCIAL,
      petals_delta: PETALS_REWARD,
      spin_credit: 0,
      labels_json: {
        activity_type: activityType,
        created_for: 'social_activity'
      },
      expires_at: expiresAt,
      created_by_tg_id: createdByTgId,
      crc8_checksum: checksum,
    });

    await this.promoCodeRepository.save(promoCode);

    // Generate QR code
    const qrCode = await QRCodeGenerator.generateQR(code);

    return {
      code,
      qr_code: qrCode,
      expires_at: expiresAt,
      petals_reward: PETALS_REWARD,
      message: `🌸 Промокод за активность в соцсетях готов!\n\nКод: ${code}\n+${PETALS_REWARD} лепестков\nДействует до: ${expiresAt.toLocaleDateString('ru-RU')}\n\nЛимит: 1 активация в 30 дней`
    };
  }

  async checkSocialActivityEligibility(tgId: string): Promise<{
    eligible: boolean;
    days_until_next?: number;
    last_activity_date?: Date;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const lastSocialActivity = await this.transactionRepository.findOne({
      where: {
        tg_id: tgId,
        kind: TransactionKind.SOCIAL_ACTIVITY,
      },
      order: { ts: 'DESC' }
    });

    if (!lastSocialActivity) {
      return { eligible: true };
    }

    const lastActivityDate = lastSocialActivity.ts;
    const timeSinceLastActivity = Date.now() - lastActivityDate.getTime();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

    if (timeSinceLastActivity >= thirtyDaysInMs) {
      return { eligible: true, last_activity_date: lastActivityDate };
    }

    const nextEligibleDate = new Date(lastActivityDate.getTime() + thirtyDaysInMs);
    const daysUntilNext = Math.ceil((nextEligibleDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    return {
      eligible: false,
      days_until_next: daysUntilNext,
      last_activity_date: lastActivityDate
    };
  }

  async getSocialActivityStats(tgId: string): Promise<{
    total_activities: number;
    last_activity_date?: Date;
    next_available_date?: Date;
    eligible_now: boolean;
  }> {
    const activities = await this.transactionRepository.find({
      where: {
        tg_id: tgId,
        kind: TransactionKind.SOCIAL_ACTIVITY
      },
      order: { ts: 'DESC' }
    });

    const eligibility = await this.checkSocialActivityEligibility(tgId);
    
    let nextAvailableDate: Date | undefined;
    if (!eligibility.eligible && eligibility.last_activity_date) {
      nextAvailableDate = new Date(eligibility.last_activity_date.getTime() + (30 * 24 * 60 * 60 * 1000));
    }

    return {
      total_activities: activities.length,
      last_activity_date: activities[0]?.ts,
      next_available_date: nextAvailableDate,
      eligible_now: eligibility.eligible
    };
  }

  async getSocialInstructions(): Promise<{
    instructions: Array<{
      type: string;
      title: string;
      description: string;
      reward: number;
    }>;
    cooldown_days: number;
  }> {
    return {
      instructions: [
        {
          type: 'story',
          title: 'Опубликуйте сторис',
          description: 'Сделайте фото своего букета от Stvol Garden и опубликуйте в сторис с отметкой @stvol_garden',
          reward: 5
        },
        {
          type: 'post',
          title: 'Сделайте пост',
          description: 'Опубликуйте фото с букетом в ленте Instagram с хештегом #StvolGarden',
          reward: 5
        },
        {
          type: 'mention',
          title: 'Отметьте нас',
          description: 'Отметьте @stvol_garden в своих постах или сторис с букетами',
          reward: 5
        }
      ],
      cooldown_days: 30
    };
  }
}