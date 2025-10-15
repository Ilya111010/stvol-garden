import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { Referral } from '../../entities/referral.entity';
import { User } from '../../entities/user.entity';
import { Balance } from '../../entities/balance.entity';
import { Transaction } from '../../entities/transaction.entity';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Referral, User, Balance, Transaction]),
    BalanceModule
  ],
  providers: [ReferralService],
  controllers: [ReferralController],
  exports: [ReferralService]
})
export class ReferralModule {}