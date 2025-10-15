import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('config')
export class Config {
  @PrimaryColumn()
  key: string;

  @Column('text')
  value: any;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('bigint', { nullable: true })
  updated_by_tg_id: string;
}

// Default configuration structure
export interface AppConfig {
  economy: {
    order_ranges: Array<{
      min_amount: number;
      max_amount: number;
      petals: number;
      spins: number;
    }>;
    social_activity: {
      petals_reward: number;
      cooldown_days: number;
    };
    referral: {
      inviter_petals: number;
      invitee_petals: number;
      min_order_amount: number;
      max_referrals_per_year: number;
    };
  };
  wheel: {
    cooldown_days: number;
    prizes: Array<{
      id: string;
      type: 'petals' | 'discount' | 'gift';
      value: number;
      label: string;
      probability: number;
      color: string;
    }>;
  };
  rewards: Array<{
    id: string;
    name: string;
    description: string;
    petals_cost: number;
    discount_percent?: number;
    max_discount_amount?: number;
    min_order_amount?: number;
    is_active: boolean;
  }>;
  rate_limits: {
    promo_activations_per_minute: number;
    wheel_spins_per_day: number;
  };
}