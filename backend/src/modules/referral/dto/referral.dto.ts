import { IsNumber, IsOptional, Min } from 'class-validator';

export class ConfirmOrderDto {
  @IsNumber()
  @Min(0)
  order_amount: number;

  @IsOptional()
  order_id?: string;
}

export interface ReferralStatsDto {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_bonus_earned: number;
  referrals_this_year: number;
  remaining_referrals: number;
}

export interface ReferralListDto {
  id: number;
  invitee_tg_id: string;
  invitee_first_name?: string;
  invitee_username?: string;
  first_order_confirmed_at?: Date;
  first_order_amount?: number;
  bonus_paid: boolean;
  created_at: Date;
  status: 'pending' | 'confirmed' | 'bonus_paid';
}