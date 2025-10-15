import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../../entities/config.entity';
import { BalanceService } from '../balance/balance.service';
import { TransactionKind } from '../../entities/transaction.entity';
import { WheelPrize, SpinResult, SpinWheelResponseDto } from './dto/spin-wheel.dto';

@Injectable()
export class WheelService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
    private balanceService: BalanceService,
  ) {}

  async getWheelConfiguration(): Promise<WheelPrize[]> {
    const config = await this.configRepository.findOne({
      where: { key: 'wheel_config' }
    });

    if (!config) {
      // Return default wheel configuration
      return this.getDefaultWheelPrizes();
    }

    return config.value.prizes || this.getDefaultWheelPrizes();
  }

  private getDefaultWheelPrizes(): WheelPrize[] {
    return [
      {
        id: 'petals_2',
        type: 'petals',
        value: 2,
        label: '+2 лепестка',
        probability: 0.25,
        color: '#FFB6C1'
      },
      {
        id: 'petals_5',
        type: 'petals',
        value: 5,
        label: '+5 лепестков',
        probability: 0.20,
        color: '#FF69B4'
      },
      {
        id: 'discount_5',
        type: 'discount',
        value: 5,
        label: 'Скидка 5%',
        probability: 0.15,
        color: '#DDA0DD'
      },
      {
        id: 'petals_10',
        type: 'petals',
        value: 10,
        label: '+10 лепестков',
        probability: 0.15,
        color: '#FF1493'
      },
      {
        id: 'discount_10',
        type: 'discount',
        value: 10,
        label: 'Скидка 10%',
        probability: 0.10,
        color: '#BA55D3'
      },
      {
        id: 'gift_bouquet',
        type: 'gift',
        value: 1,
        label: 'Мини-букет',
        probability: 0.10,
        color: '#9370DB'
      },
      {
        id: 'petals_20',
        type: 'petals',
        value: 20,
        label: '+20 лепестков',
        probability: 0.04,
        color: '#8B008B'
      },
      {
        id: 'gift_large',
        type: 'gift',
        value: 2,
        label: 'Большой букет',
        probability: 0.01,
        color: '#4B0082'
      }
    ];
  }

  async spinWheel(tgId: string): Promise<SpinWheelResponseDto> {
    try {
      // Check if user can spin
      const balance = await this.balanceService.getBalance(tgId);
      
      if (balance.spin_credits <= 0) {
        throw new BadRequestException('Нет доступных спинов');
      }

      if (!balance.can_spin) {
        const nextSpinDate = new Date(balance.next_spin_available);
        const daysLeft = Math.ceil((nextSpinDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        throw new BadRequestException(`Кулдаун колеса. Следующий спин доступен через ${daysLeft} дней`);
      }

      // Use spin credit
      await this.balanceService.useSpinCredit(tgId);

      // Get wheel configuration
      const prizes = await this.getWheelConfiguration();

      // Select random prize based on probabilities
      const selectedPrize = this.selectRandomPrize(prizes);
      
      // Calculate spin animation details
      const spinResult: SpinResult = {
        prize: selectedPrize,
        angle: this.calculateWinningAngle(prizes, selectedPrize),
        duration: 3000 // 3 seconds
      };

      // Apply prize
      const updatedBalance = await this.applyPrize(tgId, selectedPrize);

      return {
        success: true,
        result: spinResult,
        message: this.getPrizeMessage(selectedPrize),
        new_balance: {
          petals: updatedBalance.petals,
          spin_credits: updatedBalance.spin_credits
        }
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Ошибка при вращении колеса'
      };
    }
  }

  private selectRandomPrize(prizes: WheelPrize[]): WheelPrize {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }

    // Fallback to first prize if something goes wrong
    return prizes[0];
  }

  private calculateWinningAngle(prizes: WheelPrize[], selectedPrize: WheelPrize): number {
    const sectorAngle = 360 / prizes.length;
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    
    // Calculate the center angle of the winning sector
    const centerAngle = prizeIndex * sectorAngle + sectorAngle / 2;
    
    // Add randomness within the sector (±15 degrees)
    const randomOffset = (Math.random() - 0.5) * (sectorAngle * 0.8);
    
    // Add multiple full rotations for visual effect (2-4 full spins)
    const fullRotations = (2 + Math.random() * 2) * 360;
    
    return fullRotations + centerAngle + randomOffset;
  }

  private async applyPrize(tgId: string, prize: WheelPrize): Promise<any> {
    switch (prize.type) {
      case 'petals':
        return await this.balanceService.addPetals(
          tgId,
          prize.value,
          TransactionKind.WHEEL_WIN,
          { 
            prize_id: prize.id,
            prize_label: prize.label,
            prize_type: 'petals'
          }
        );
        
      case 'discount':
      case 'gift':
        // For discounts and gifts, we just log the win
        // The actual reward will be handled by rewards system
        return await this.balanceService.addPetals(
          tgId,
          0, // No petals for discount/gift prizes
          TransactionKind.WHEEL_WIN,
          { 
            prize_id: prize.id,
            prize_label: prize.label,
            prize_type: prize.type,
            prize_value: prize.value
          }
        );
        
      default:
        throw new Error('Unknown prize type');
    }
  }

  private getPrizeMessage(prize: WheelPrize): string {
    switch (prize.type) {
      case 'petals':
        return `🌸 Поздравляем! Вы выиграли ${prize.value} лепестков!`;
      case 'discount':
        return `🎉 Поздравляем! Вы выиграли скидку ${prize.value}%!`;
      case 'gift':
        return `🎁 Поздравляем! Вы выиграли ${prize.label}!`;
      default:
        return 'Поздравляем с выигрышем!';
    }
  }
}