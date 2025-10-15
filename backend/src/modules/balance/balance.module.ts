import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { Balance } from '../../entities/balance.entity';
import { User } from '../../entities/user.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Balance, User, Transaction])
  ],
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService]
})
export class BalanceModule {}