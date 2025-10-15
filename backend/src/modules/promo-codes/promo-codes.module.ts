import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCode } from '../../entities/promo-code.entity';
import { User } from '../../entities/user.entity';
import { Balance } from '../../entities/balance.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromoCode, User, Balance, Transaction])
  ],
  providers: [PromoCodesService],
  controllers: [PromoCodesController],
  exports: [PromoCodesService]
})
export class PromoCodesModule {}