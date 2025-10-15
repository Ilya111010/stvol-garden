import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { seedDefaultConfig } from './default-config.seed';
import { User } from '../entities/user.entity';
import { Balance } from '../entities/balance.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { Transaction } from '../entities/transaction.entity';
import { Role } from '../entities/role.entity';
import { Referral } from '../entities/referral.entity';
import { Config } from '../entities/config.entity';

// Load environment variables
config();

async function runSeeds() {
  console.log('🌱 Starting database seeding...');

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 
         'postgresql://stvol_user:stvol_password@localhost:5432/stvol_garden',
    entities: [User, Balance, PromoCode, Transaction, Role, Referral, Config],
    synchronize: true, // This will create tables if they don't exist
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('📊 Database connection established');

    // Run seeds
    await seedDefaultConfig(dataSource);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds };