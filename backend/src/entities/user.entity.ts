import { Entity, PrimaryColumn, CreateDateColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { Balance } from './balance.entity';
import { Transaction } from './transaction.entity';
import { Role } from './role.entity';
import { Referral } from './referral.entity';

@Entity('users')
export class User {
  @PrimaryColumn('bigint')
  tg_id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column('bigint', { nullable: true })
  ref_parent_tg_id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToOne(() => Balance, balance => balance.user)
  balance: Balance;

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToOne(() => Role, role => role.user)
  role: Role;

  @OneToMany(() => Referral, referral => referral.inviter)
  referrals_made: Referral[];

  @OneToMany(() => Referral, referral => referral.invitee)
  referrals_received: Referral[];
}