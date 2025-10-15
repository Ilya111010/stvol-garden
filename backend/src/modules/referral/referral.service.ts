import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Referral } from '../../entities/referral.entity';
import { User } from '../../entities/user.entity';
import { BalanceService } from '../balance/balance.service';
import { TransactionKind } from '../../entities/transaction.entity';
import { ReferralStatsDto, ReferralListDto, ConfirmOrderDto } from './dto/referral.dto';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private balanceService: BalanceService,
    private dataSource: DataSource,
  ) {}

  async processReferral(inviteeTgId: string, inviterTgId: string): Promise<void> {
    // Check if user is not referring themselves
    if (inviteeTgId === inviterTgId) {
      throw new BadRequestException('Нельзя пригласить самого себя');
    }

    // Check if referral already exists
    const existingReferral = await this.referralRepository.findOne({
      where: { invitee_tg_id: inviteeTgId }
    });

    if (existingReferral) {
      return; // User already has a referrer
    }

    // Check yearly limit for inviter
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    const referralsThisYear = await this.referralRepository
      .createQueryBuilder('referral')
      .where('referral.inviter_tg_id = :inviterTgId', { inviterTgId })
      .andWhere('referral.bonus_paid = :bonusPaid', { bonusPaid: true })
      .andWhere('referral.first_order_confirmed_at >= :yearStart', { yearStart })
      .andWhere('referral.first_order_confirmed_at < :yearEnd', { yearEnd })
      .getCount();

    if (referralsThisYear >= 20) {
      throw new BadRequestException('Достигнут лимит рефералов на год (20)');
    }

    // Ensure both users exist
    await this.ensureUserExists(inviteeTgId);
    await this.ensureUserExists(inviterTgId);

    // Create referral record
    const referral = this.referralRepository.create({
      inviter_tg_id: inviterTgId,
      invitee_tg_id: inviteeTgId,
    });

    await this.referralRepository.save(referral);
  }

  async confirmFirstOrder(inviteeTgId: string, orderData: ConfirmOrderDto): Promise<any> {
    const MIN_ORDER_AMOUNT = 2000; // 2000 RUB minimum for referral bonus

    if (orderData.order_amount < MIN_ORDER_AMOUNT) {
      return {
        success: false,
        message: `Минимальная сумма заказа для реферального бонуса: ${MIN_ORDER_AMOUNT}₽`
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find pending referral
      const referral = await queryRunner.manager.findOne(Referral, {
        where: { 
          invitee_tg_id: inviteeTgId,
          first_order_confirmed_at: null
        }
      });

      if (!referral) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: 'Реферальная запись не найдена'
        };
      }

      // Update referral with order info
      referral.first_order_confirmed_at = new Date();
      referral.first_order_amount = orderData.order_amount;
      await queryRunner.manager.save(referral);

      // Give bonus to invitee (+6 petals)
      await this.balanceService.addPetals(
        inviteeTgId,
        6,
        TransactionKind.REFERRAL_BONUS,
        {
          type: 'invitee_bonus',
          order_amount: orderData.order_amount,
          inviter_tg_id: referral.inviter_tg_id
        }
      );

      // Give bonus to inviter (+3 petals)
      await this.balanceService.addPetals(
        referral.inviter_tg_id,
        3,
        TransactionKind.REFERRAL_BONUS,
        {
          type: 'inviter_bonus',
          order_amount: orderData.order_amount,
          invitee_tg_id: inviteeTgId
        }
      );

      // Mark bonus as paid
      referral.bonus_paid = true;
      await queryRunner.manager.save(referral);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: '🎉 Реферальный бонус начислен! +6 лепестков вам, +3 пригласившему',
        bonuses: {
          invitee_bonus: 6,
          inviter_bonus: 3
        }
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getReferralStats(tgId: string): Promise<ReferralStatsDto> {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    const [totalReferrals, successfulReferrals, referralsThisYear] = await Promise.all([
      this.referralRepository.count({
        where: { inviter_tg_id: tgId }
      }),
      this.referralRepository.count({
        where: { 
          inviter_tg_id: tgId,
          bonus_paid: true
        }
      }),
      this.referralRepository
        .createQueryBuilder('referral')
        .where('referral.inviter_tg_id = :tgId', { tgId })
        .andWhere('referral.bonus_paid = :bonusPaid', { bonusPaid: true })
        .andWhere('referral.first_order_confirmed_at >= :yearStart', { yearStart })
        .andWhere('referral.first_order_confirmed_at < :yearEnd', { yearEnd })
        .getCount()
    ]);

    const pendingReferrals = totalReferrals - successfulReferrals;
    const totalBonusEarned = successfulReferrals * 3; // 3 petals per successful referral
    const remainingReferrals = Math.max(0, 20 - referralsThisYear);

    return {
      total_referrals: totalReferrals,
      successful_referrals: successfulReferrals,
      pending_referrals: pendingReferrals,
      total_bonus_earned: totalBonusEarned,
      referrals_this_year: referralsThisYear,
      remaining_referrals: remainingReferrals
    };
  }

  async getReferralList(tgId: string): Promise<ReferralListDto[]> {
    const referrals = await this.referralRepository.find({
      where: { inviter_tg_id: tgId },
      order: { created_at: 'DESC' },
      take: 50
    });

    // Get user info for invitees
    const inviteeIds = referrals.map(r => r.invitee_tg_id);
    const users = await this.userRepository.find({
      where: inviteeIds.map(id => ({ tg_id: id }))
    });

    const userMap = new Map(users.map(u => [u.tg_id, u]));

    return referrals.map(referral => {
      const user = userMap.get(referral.invitee_tg_id);
      
      let status: 'pending' | 'confirmed' | 'bonus_paid' = 'pending';
      if (referral.bonus_paid) {
        status = 'bonus_paid';
      } else if (referral.first_order_confirmed_at) {
        status = 'confirmed';
      }

      return {
        id: referral.id,
        invitee_tg_id: referral.invitee_tg_id,
        invitee_first_name: user?.first_name,
        invitee_username: user?.username,
        first_order_confirmed_at: referral.first_order_confirmed_at,
        first_order_amount: referral.first_order_amount,
        bonus_paid: referral.bonus_paid,
        created_at: referral.created_at,
        status
      };
    });
  }

  generateReferralLink(tgId: string): string {
    return `https://t.me/stvol_gardenBot?start=ref_${tgId}`;
  }

  private async ensureUserExists(tgId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { tg_id: tgId } });
    if (!user) {
      const newUser = this.userRepository.create({ tg_id: tgId });
      await this.userRepository.save(newUser);
    }
  }
}