import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Balance } from '../../entities/balance.entity';
import { User } from '../../entities/user.entity';
import { Transaction, TransactionKind } from '../../entities/transaction.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async getOrCreateBalance(tgId: string): Promise<Balance> {
    let balance = await this.balanceRepository.findOne({ where: { tg_id: tgId } });
    
    if (!balance) {
      // Ensure user exists
      let user = await this.userRepository.findOne({ where: { tg_id: tgId } });
      if (!user) {
        user = this.userRepository.create({ tg_id: tgId });
        await this.userRepository.save(user);
      }

      balance = this.balanceRepository.create({
        tg_id: tgId,
        petals: 0,
        spin_credits: 0
      });
      await this.balanceRepository.save(balance);
    }

    return balance;
  }

  async getBalance(tgId: string): Promise<any> {
    const balance = await this.getOrCreateBalance(tgId);
    
    // Check if user can spin (no cooldown)
    const canSpin = balance.spin_credits > 0 && this.canUserSpin(balance);

    return {
      petals: balance.petals,
      spin_credits: balance.spin_credits,
      can_spin: canSpin,
      last_spin_at: balance.last_spin_at,
      next_spin_available: balance.last_spin_at ? this.getNextSpinDate(balance.last_spin_at) : null
    };
  }

  private canUserSpin(balance: Balance): boolean {
    if (!balance.last_spin_at) return true;
    
    const cooldownDays = 14; // 14 days cooldown
    const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
    const timeSinceLastSpin = Date.now() - balance.last_spin_at.getTime();
    
    return timeSinceLastSpin >= cooldownMs;
  }

  private getNextSpinDate(lastSpinAt: Date): Date {
    const nextSpin = new Date(lastSpinAt);
    nextSpin.setDate(nextSpin.getDate() + 14);
    return nextSpin;
  }

  async addPetals(
    tgId: string,
    amount: number,
    kind: TransactionKind,
    metadata?: any
  ): Promise<Balance> {
    const balance = await this.balanceRepository.findOne({
      where: { tg_id: tgId }
    });

    if (!balance) {
      throw new Error('Balance not found');
    }

    balance.petals += amount;
    await this.balanceRepository.save(balance);

    // Log transaction
    const transaction = this.transactionRepository.create({
      tg_id: tgId,
      delta: amount,
      kind,
      meta_json: metadata
    });

    await this.transactionRepository.save(transaction);
    return balance;
  }

  async deductPetals(
    tgId: string,
    amount: number,
    kind: TransactionKind,
    metadata?: any
  ): Promise<Balance> {
    const balance = await this.balanceRepository.findOne({
      where: { tg_id: tgId }
    });

    if (!balance) {
      throw new Error('Balance not found');
    }

    if (balance.petals < amount) {
      throw new Error('Insufficient petals');
    }

    balance.petals -= amount;
    await this.balanceRepository.save(balance);

    // Log transaction
    const transaction = this.transactionRepository.create({
      tg_id: tgId,
      delta: -amount,
      kind,
      meta_json: metadata
    });

    await this.transactionRepository.save(transaction);
    return balance;
  }

  async useSpinCredit(tgId: string): Promise<Balance> {
    // For SQLite, we'll use a simpler approach without pessimistic locking
    const balance = await this.balanceRepository.findOne({
      where: { tg_id: tgId }
    });

    if (!balance) {
      throw new Error('Balance not found');
    }

    if (balance.spin_credits <= 0) {
      throw new Error('No spin credits available');
    }

    if (!this.canUserSpin(balance)) {
      throw new Error('Spin cooldown active');
    }

    balance.spin_credits -= 1;
    balance.last_spin_at = new Date();
    await this.balanceRepository.save(balance);

    return balance;
  }

  async getTransactionHistory(tgId: string, limit: number = 20): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { tg_id: tgId },
      order: { ts: 'DESC' },
      take: limit
    });
  }
}