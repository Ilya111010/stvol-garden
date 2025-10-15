import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum TransactionKind {
  PROMO_ACTIVATION = 'PROMO_ACTIVATION',
  WHEEL_WIN = 'WHEEL_WIN',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  SOCIAL_ACTIVITY = 'SOCIAL_ACTIVITY',
  REWARD_EXCHANGE = 'REWARD_EXCHANGE',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT'
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  tg_id: string;

  @Column('int', { comment: 'Positive for credits, negative for debits' })
  delta: number;

  @Column('varchar')
  kind: TransactionKind;

  @Column('text', { nullable: true, comment: 'Additional metadata like promo_code, wheel_result, etc' })
  meta_json: any;

  @CreateDateColumn()
  ts: Date;

  @ManyToOne(() => User, user => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tg_id' })
  user: User;
}