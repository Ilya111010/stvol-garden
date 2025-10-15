import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PromoCodeType {
  ORDER = 'ORDER',
  SOCIAL = 'SOCIAL',
  REWARD = 'REWARD'
}

@Entity('codes')
export class PromoCode {
  @PrimaryColumn()
  code: string;

  @Column('varchar')
  type: PromoCodeType;

  @Column('text', { nullable: true, comment: 'Additional metadata like order_amount, reward_type' })
  labels_json: any;

  @Column('int', { comment: 'Petals to add when activated' })
  petals_delta: number;

  @Column('int', { default: 0, comment: 'Spin credits to add when activated' })
  spin_credit: number;

  @Column('datetime')
  expires_at: Date;

  @Column({ default: true })
  single_use: boolean;

  @Column('bigint', { nullable: true, comment: 'Bound to specific Telegram ID after activation' })
  bound_tg_id: string;

  @Column('datetime', { nullable: true })
  used_at: Date;

  @Column('bigint', { nullable: true, comment: 'Staff member who created this code' })
  created_by_tg_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: false })
  is_used: boolean;

  // For CRC-8 validation
  @Column({ nullable: true })
  crc8_checksum: string;
}