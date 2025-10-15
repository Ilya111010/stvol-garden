import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { databaseConfig } from './config/database';
import { memoryDatabaseConfig } from './config/memory-database';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { BalanceModule } from './modules/balance/balance.module';
import { WheelModule } from './modules/wheel/wheel.module';
import { ReferralModule } from './modules/referral/referral.module';
import { SocialModule } from './modules/social/social.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Use memory database for demo if no DATABASE_URL is provided
        const dbUrl = configService.get<string>('DATABASE_URL');
        if (!dbUrl || dbUrl.includes('localhost')) {
          console.log('🗄️ Using in-memory SQLite database for demo');
          return memoryDatabaseConfig();
        }
        return databaseConfig(configService);
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 5, // 5 requests per minute for promo code activation
    }]),
    AuthModule,
    PromoCodesModule,
    BalanceModule,
    WheelModule,
    ReferralModule,
    SocialModule,
    RewardsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}