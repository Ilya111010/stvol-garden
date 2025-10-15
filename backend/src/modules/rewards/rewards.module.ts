import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { Config } from '../../entities/config.entity';
import { PromoCode } from '../../entities/promo-code.entity';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Config, PromoCode]),
    BalanceModule
  ],
  providers: [RewardsService],
  controllers: [RewardsController],
  exports: [RewardsService]
})
export class RewardsModule {}