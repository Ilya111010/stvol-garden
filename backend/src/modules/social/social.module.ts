import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { PromoCode } from '../../entities/promo-code.entity';
import { Transaction } from '../../entities/transaction.entity';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromoCode, Transaction]),
    PromoCodesModule
  ],
  providers: [SocialService],
  controllers: [SocialController],
  exports: [SocialService]
})
export class SocialModule {}