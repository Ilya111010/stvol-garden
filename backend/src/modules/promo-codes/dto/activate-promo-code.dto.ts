import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ActivatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 16)
  @Matches(/^[A-Z0-9]+$/, { message: 'Promo code must contain only uppercase letters and numbers' })
  code: string;
}

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  type: 'ORDER' | 'SOCIAL' | 'REWARD';

  @IsString()
  petals_delta: number;

  @IsString()
  spin_credit: number;

  labels_json?: any;

  expires_in_days?: number;
}

export class PromoCodeResponseDto {
  code: string;
  qr_code?: string;
  expires_at: Date;
  created_at: Date;
}