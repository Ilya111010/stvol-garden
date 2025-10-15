import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WheelService } from './wheel.service';
import { WheelController } from './wheel.controller';
import { Balance } from '../../entities/balance.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Config } from '../../entities/config.entity';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Balance, Transaction, Config]),
    BalanceModule
  ],
  providers: [WheelService],
  controllers: [WheelController],
  exports: [WheelService]
})
export class WheelModule {}