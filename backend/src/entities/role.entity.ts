import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum UserRole {
  CLIENT = 'client',
  STAFF = 'staff',
  ADMIN = 'admin'
}

@Entity('roles')
export class Role {
  @PrimaryColumn('bigint')
  tg_id: string;

  @Column('varchar', { default: 'client' })
  role: UserRole;

  @OneToOne(() => User, user => user.role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tg_id' })
  user: User;
}