import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../../entities/config.entity';
import { PromoCode, PromoCodeType } from '../../entities/promo-code.entity';
import { BalanceService } from '../balance/balance.service';
import { TransactionKind } from '../../entities/transaction.entity';
import { PromoCodeGenerator } from '../../utils/crypto.utils';
import { QRCodeGenerator } from '../../utils/qr.utils';
import { RewardItem, ExchangeRewardResponse } from './dto/rewards.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    private balanceService: BalanceService,
  ) {}

  async getAvailableRewards(): Promise<RewardItem[]> {
    const config = await this.configRepository.findOne({
      where: { key: 'rewards_config' }
    });

    if (!config) {
      return this.getDefaultRewards();
    }

    return config.value.rewards || this.getDefaultRewards();
  }

  private getDefaultRewards(): RewardItem[] {
    return [
      {
        id: 'discount_5',
        name: 'Скидка 5%',
        description: 'Промокод на скидку 5% на следующий заказ',
        petals_cost: 10,
        discount_percent: 5,
        max_discount_amount: 100,
        min_order_amount: 500,
        is_active: true,
        icon: '🏷️',
        color: '#10b981'
      },
      {
        id: 'discount_10',
        name: 'Скидка 10%',
        description: 'Промокод на скидку 10% на следующий заказ',
        petals_cost: 20,
        discount_percent: 10,
        max_discount_amount: 200,
        min_order_amount: 1000,
        is_active: true,
        icon: '🎫',
        color: '#3b82f6'
      },
      {
        id: 'discount_15',
        name: 'Скидка 15%',
        description: 'Промокод на скидку 15% на следующий заказ',
        petals_cost: 35,
        discount_percent: 15,
        max_discount_amount: 500,
        min_order_amount: 2000,
        is_active: true,
        icon: '🎟️',
        color: '#8b5cf6'
      },
      {
        id: 'mini_bouquet',
        name: 'Мини-букет',
        description: 'Бесплатный мини-букет из 3 роз',
        petals_cost: 50,
        gift_type: 'mini_bouquet',
        is_active: true,
        icon: '💐',
        color: '#ec4899'
      },
      {
        id: 'certificate_500',
        name: 'Сертификат 500₽',
        description: 'Подарочный сертификат на 500 рублей',
        petals_cost: 100,
        gift_type: 'certificate',
        is_active: true,
        icon: '🎁',
        color: '#f59e0b'
      },
      {
        id: 'large_bouquet',
        name: 'Большой букет',
        description: 'Праздничный букет из 15 роз',
        petals_cost: 200,
        gift_type: 'large_bouquet',
        is_active: true,
        icon: '🌹',
        color: '#ef4444'
      }
    ];
  }

  async exchangeReward(tgId: string, rewardId: string): Promise<ExchangeRewardResponse> {
    // Get available rewards
    const rewards = await this.getAvailableRewards();
    const reward = rewards.find(r => r.id === rewardId);

    if (!reward) {
      throw new NotFoundException('Награда не найдена');
    }

    if (!reward.is_active) {
      throw new BadRequestException('Награда недоступна');
    }

    // Check user balance
    const balance = await this.balanceService.getBalance(tgId);
    if (balance.petals < reward.petals_cost) {
      throw new BadRequestException(`Недостаточно лепестков. Требуется: ${reward.petals_cost}, у вас: ${balance.petals}`);
    }

    // Deduct petals from balance
    await this.balanceService.deductPetals(
      tgId,
      reward.petals_cost,
      TransactionKind.REWARD_EXCHANGE,
      {
        reward_id: rewardId,
        reward_name: reward.name,
        petals_cost: reward.petals_cost
      }
    );

    // Generate promo code for the reward
    const promoCode = await this.generateRewardPromoCode(reward, tgId);

    // Get updated balance
    const updatedBalance = await this.balanceService.getBalance(tgId);

    return {
      success: true,
      message: `🎉 Награда "${reward.name}" обменена! Промокод создан`,
      promo_code: promoCode.code,
      qr_code: promoCode.qr_code,
      expires_at: promoCode.expires_at,
      new_balance: {
        petals: updatedBalance.petals,
        spin_credits: updatedBalance.spin_credits
      }
    };
  }

  private async generateRewardPromoCode(reward: RewardItem, tgId: string): Promise<{
    code: string;
    qr_code: string;
    expires_at: Date;
  }> {
    const { code, checksum } = PromoCodeGenerator.generate('RW', 10);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity for reward codes

    const labelsJson: any = {
      reward_id: reward.id,
      reward_type: reward.discount_percent ? 'discount' : 'gift',
      exchanged_by: tgId
    };

    if (reward.discount_percent) {
      labelsJson.discount_percent = reward.discount_percent;
      labelsJson.max_discount_amount = reward.max_discount_amount;
      labelsJson.min_order_amount = reward.min_order_amount;
    }

    if (reward.gift_type) {
      labelsJson.gift_type = reward.gift_type;
    }

    const promoCode = this.promoCodeRepository.create({
      code,
      type: PromoCodeType.REWARD,
      petals_delta: 0, // Reward codes don't give petals
      spin_credit: 0,
      labels_json: labelsJson,
      expires_at: expiresAt,
      created_by_tg_id: 'system',
      bound_tg_id: tgId, // Pre-bind to the user who exchanged
      crc8_checksum: checksum,
    });

    await this.promoCodeRepository.save(promoCode);

    // Generate QR code
    const qrCode = await QRCodeGenerator.generateQR(code);

    return {
      code,
      qr_code: qrCode,
      expires_at: expiresAt
    };
  }

  async getUserRewardHistory(tgId: string): Promise<any[]> {
    const rewardCodes = await this.promoCodeRepository.find({
      where: {
        type: PromoCodeType.REWARD,
        bound_tg_id: tgId
      },
      order: { created_at: 'DESC' },
      take: 20
    });

    return rewardCodes.map(code => ({
      id: code.code,
      reward_name: code.labels_json?.reward_id || 'Неизвестная награда',
      code: code.code,
      is_used: code.is_used,
      used_at: code.used_at,
      expires_at: code.expires_at,
      created_at: code.created_at,
      details: code.labels_json
    }));
  }
}