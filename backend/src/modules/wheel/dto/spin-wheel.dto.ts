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

export interface SpinWheelResponseDto {
  success: boolean;
  result?: SpinResult;
  message: string;
  new_balance?: {
    petals: number;
    spin_credits: number;
  };
}