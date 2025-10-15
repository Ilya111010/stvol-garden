import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Balance } from '../entities/balance.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { Transaction } from '../entities/transaction.entity';
import { Role } from '../entities/role.entity';
import { Referral } from '../entities/referral.entity';
import { Config } from '../entities/config.entity';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL') || 
       'postgresql://stvol_user:stvol_password@localhost:5432/stvol_garden',
  entities: [User, Balance, PromoCode, Transaction, Role, Referral, Config],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// For TypeORM CLI
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 
       'postgresql://stvol_user:stvol_password@localhost:5432/stvol_garden',
  entities: [User, Balance, PromoCode, Transaction, Role, Referral, Config],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;