export interface RewardItem {
  id: string;
  name: string;
  description: string;
  petals_cost: number;
  discount_percent?: number;
  max_discount_amount?: number;
  min_order_amount?: number;
  gift_type?: 'mini_bouquet' | 'large_bouquet' | 'certificate';
  is_active: boolean;
  icon: string;
  color: string;
}

export interface ExchangeRewardResponse {
  success: boolean;
  message: string;
  promo_code?: string;
  qr_code?: string;
  expires_at?: Date;
  new_balance?: {
    petals: number;
    spin_credits: number;
  };
}