import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Balance } from '../entities/balance.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { Transaction } from '../entities/transaction.entity';
import { Role } from '../entities/role.entity';
import { Referral } from '../entities/referral.entity';
import { Config } from '../entities/config.entity';

export const memoryDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: ':memory:',
  entities: [User, Balance, PromoCode, Transaction, Role, Referral, Config],
  synchronize: true,
  logging: false,
});
