export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface Balance {
  petals: number;
  spin_credits: number;
  can_spin: boolean;
  last_spin_at?: string;
  next_spin_available?: string;
}

export interface PromoCode {
  code: string;
  type: 'ORDER' | 'SOCIAL' | 'REWARD';
  petals_delta: number;
  spin_credit: number;
  expires_at: string;
  created_at: string;
  qr_code?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'PROMO_ACTIVATION' | 'WHEEL_WIN' | 'REFERRAL_BONUS' | 'SOCIAL_ACTIVITY' | 'REWARD_EXCHANGE' | 'ADMIN_ADJUSTMENT';
  date: string;
  metadata?: any;
}

export interface WheelPrize {
  id: string;
  type: 'petals' | 'discount' | 'gift';
  value: number;
  label: string;
  probability: number;
  color: string;
}

export interface SpinResult {
  prize: WheelPrize;
  angle: number;
  duration: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ActivatePromoResponse {
  success: boolean;
  message: string;
  petals_added?: number;
  spin_credits_added?: number;
  new_balance?: Balance;
}

export interface SpinWheelResponse {
  success: boolean;
  result?: SpinResult;
  message: string;
  new_balance?: Balance;
}

export interface Referral {
  id: number;
  invitee_username?: string;
  invitee_first_name: string;
  first_order_confirmed_at?: string;
  first_order_amount?: number;
  bonus_paid: boolean;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  petals_cost: number;
  discount_percent?: number;
  max_discount_amount?: number;
  min_order_amount?: number;
  is_active: boolean;
}