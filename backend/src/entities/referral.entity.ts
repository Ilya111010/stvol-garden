import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  inviter_tg_id: string;

  @Column('bigint')
  invitee_tg_id: string;

  @Column('datetime', { nullable: true })
  first_order_confirmed_at: Date;

  @Column('decimal', { nullable: true, precision: 10, scale: 2 })
  first_order_amount: number;

  @Column({ default: false })
  bonus_paid: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.referrals_made)
  @JoinColumn({ name: 'inviter_tg_id' })
  inviter: User;

  @ManyToOne(() => User, user => user.referrals_received)
  @JoinColumn({ name: 'invitee_tg_id' })
  invitee: User;
}