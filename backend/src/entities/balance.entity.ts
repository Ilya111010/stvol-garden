import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('balances')
export class Balance {
  @PrimaryColumn('bigint')
  tg_id: string;

  @Column('int', { default: 0 })
  petals: number;

  @Column('int', { default: 0, comment: 'Max 1 spin credit at a time' })
  spin_credits: number;

  @Column('datetime', { nullable: true })
  last_spin_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, user => user.balance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tg_id' })
  user: User;
}