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

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL') || 
                      'postgresql://stvol_user:stvol_password@localhost:5432/stvol_garden';
  
  // Check if this is a remote database (Supabase, Railway, etc.)
  const isRemoteDB = databaseUrl.includes('supabase') || 
                     databaseUrl.includes('railway') || 
                     databaseUrl.includes('render') ||
                     !databaseUrl.includes('localhost');

  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [User, Balance, PromoCode, Transaction, Role, Referral, Config],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: isRemoteDB ? { rejectUnauthorized: false } : false,
    extra: isRemoteDB ? {
      ssl: {
        rejectUnauthorized: false,
      }
    } : {}
  };
};

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