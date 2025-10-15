import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PromoCode, PromoCodeType } from '../../entities/promo-code.entity';
import { User } from '../../entities/user.entity';
import { Balance } from '../../entities/balance.entity';
import { Transaction, TransactionKind } from '../../entities/transaction.entity';
import { PromoCodeGenerator } from '../../utils/crypto.utils';
import { QRCodeGenerator } from '../../utils/qr.utils';
import { CreatePromoCodeDto, PromoCodeResponseDto } from './dto/activate-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async createPromoCode(
    createDto: CreatePromoCodeDto,
    createdByTgId: string,
  ): Promise<PromoCodeResponseDto> {
    const prefix = createDto.type === 'ORDER' ? 'OR' : 
                   createDto.type === 'SOCIAL' ? 'SC' : 'RW';
    
    const { code, checksum } = PromoCodeGenerator.generate(prefix, 10);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (createDto.expires_in_days || 14));

    const promoCode = this.promoCodeRepository.create({
      code,
      type: createDto.type as PromoCodeType,
      petals_delta: createDto.petals_delta,
      spin_credit: createDto.spin_credit,
      labels_json: createDto.labels_json,
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
      created_at: promoCode.created_at,
    };
  }

  async activatePromoCode(code: string, tgId: string): Promise<any> {
    // Validate CRC-8
    if (!PromoCodeGenerator.validateCode(code)) {
      throw new BadRequestException('Неверный код');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find promo code
      const promoCode = await queryRunner.manager.findOne(PromoCode, {
        where: { code }
      });

      if (!promoCode) {
        throw new NotFoundException('Код не найден');
      }

      // Check if expired
      if (promoCode.expires_at < new Date()) {
        throw new BadRequestException('Срок действия кода истёк');
      }

      // Check if already used
      if (promoCode.is_used) {
        throw new ConflictException('Код уже активирован');
      }

      // Check if bound to another user
      if (promoCode.bound_tg_id && promoCode.bound_tg_id !== tgId) {
        throw new BadRequestException('Код не может быть использован этим пользователем');
      }

      // Ensure user exists
      let user = await queryRunner.manager.findOne(User, { where: { tg_id: tgId } });
      if (!user) {
        user = queryRunner.manager.create(User, { tg_id: tgId });
        await queryRunner.manager.save(user);
      }

      // Ensure balance exists
      let balance = await queryRunner.manager.findOne(Balance, { where: { tg_id: tgId } });
      if (!balance) {
        balance = queryRunner.manager.create(Balance, { tg_id: tgId, petals: 0, spin_credits: 0 });
      }

      // Check social activity cooldown
      if (promoCode.type === PromoCodeType.SOCIAL) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSocialActivation = await queryRunner.manager
          .getRepository(Transaction)
          .createQueryBuilder('transaction')
          .where('transaction.tg_id = :tgId', { tgId })
          .andWhere('transaction.kind = :kind', { kind: TransactionKind.SOCIAL_ACTIVITY })
          .andWhere('transaction.ts > :date', { date: thirtyDaysAgo })
          .getOne();

        if (recentSocialActivation) {
          throw new BadRequestException('Лимит социальной активности: можно активировать только раз в 30 дней');
        }
      }

      // Update balance
      balance.petals += promoCode.petals_delta;
      
      // Handle spin credits (max 1)
      if (promoCode.spin_credit > 0) {
        balance.spin_credits = Math.min(1, balance.spin_credits + promoCode.spin_credit);
      }

      await queryRunner.manager.save(balance);

      // Mark promo code as used
      promoCode.is_used = true;
      promoCode.used_at = new Date();
      promoCode.bound_tg_id = tgId;
      await queryRunner.manager.save(promoCode);

      // Create transaction log
      const transaction = queryRunner.manager.create(Transaction, {
        tg_id: tgId,
        delta: promoCode.petals_delta,
        kind: promoCode.type === PromoCodeType.ORDER ? TransactionKind.PROMO_ACTIVATION :
              promoCode.type === PromoCodeType.SOCIAL ? TransactionKind.SOCIAL_ACTIVITY :
              TransactionKind.PROMO_ACTIVATION,
        meta_json: {
          promo_code: code,
          type: promoCode.type,
          spin_credits_added: promoCode.spin_credit
        }
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      // Return success message
      const message = promoCode.type === PromoCodeType.ORDER 
        ? `✅ Начислено +${promoCode.petals_delta} лепестков${promoCode.spin_credit > 0 ? '. Доступен 1 спин' : ''}`
        : `✅ +${promoCode.petals_delta} лепестков за отметку в соцсетях`;

      return {
        success: true,
        message,
        petals_added: promoCode.petals_delta,
        spin_credits_added: promoCode.spin_credit,
        new_balance: {
          petals: balance.petals,
          spin_credits: balance.spin_credits
        }
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserActivationHistory(tgId: string): Promise<any[]> {
    const transactions = await this.transactionRepository.find({
      where: { tg_id: tgId },
      order: { ts: 'DESC' },
      take: 20
    });

    return transactions.map(t => ({
      id: t.id,
      type: t.kind,
      petals: t.delta,
      date: t.ts,
      details: t.meta_json
    }));
  }
}