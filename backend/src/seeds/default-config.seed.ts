import { DataSource } from 'typeorm';
import { Config } from '../entities/config.entity';

export async function seedDefaultConfig(dataSource: DataSource) {
  const configRepository = dataSource.getRepository(Config);

  // Default economy configuration
  const economyConfig = {
    order_ranges: [
      {
        min_amount: 1500,
        max_amount: 1999,
        petals: 2,
        spins: 0
      },
      {
        min_amount: 2000,
        max_amount: 2999,
        petals: 3,
        spins: 1
      },
      {
        min_amount: 3000,
        max_amount: 4999,
        petals: 5,
        spins: 1
      },
      {
        min_amount: 5000,
        max_amount: 9999,
        petals: 8,
        spins: 1
      },
      {
        min_amount: 10000,
        max_amount: 999999,
        petals: 15,
        spins: 1
      }
    ],
    social_activity: {
      petals_reward: 5,
      cooldown_days: 30
    },
    referral: {
      inviter_petals: 3,
      invitee_petals: 6,
      min_order_amount: 2000,
      max_referrals_per_year: 20
    }
  };

  // Default wheel configuration
  const wheelConfig = {
    cooldown_days: 14,
    prizes: [
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
    ]
  };

  // Default rewards configuration
  const rewardsConfig = {
    rewards: [
      {
        id: 'discount_5',
        name: 'Скидка 5%',
        description: 'Промокод на скидку 5% на следующий заказ',
        petals_cost: 10,
        discount_percent: 5,
        max_discount_amount: 100,
        min_order_amount: 500,
        is_active: true,
        icon: '🏷️',
        color: '#10b981'
      },
      {
        id: 'discount_10',
        name: 'Скидка 10%',
        description: 'Промокод на скидку 10% на следующий заказ',
        petals_cost: 20,
        discount_percent: 10,
        max_discount_amount: 200,
        min_order_amount: 1000,
        is_active: true,
        icon: '🎫',
        color: '#3b82f6'
      },
      {
        id: 'discount_15',
        name: 'Скидка 15%',
        description: 'Промокод на скидку 15% на следующий заказ',
        petals_cost: 35,
        discount_percent: 15,
        max_discount_amount: 500,
        min_order_amount: 2000,
        is_active: true,
        icon: '🎟️',
        color: '#8b5cf6'
      },
      {
        id: 'mini_bouquet',
        name: 'Мини-букет',
        description: 'Бесплатный мини-букет из 3 роз',
        petals_cost: 50,
        gift_type: 'mini_bouquet',
        is_active: true,
        icon: '💐',
        color: '#ec4899'
      },
      {
        id: 'certificate_500',
        name: 'Сертификат 500₽',
        description: 'Подарочный сертификат на 500 рублей',
        petals_cost: 100,
        gift_type: 'certificate',
        is_active: true,
        icon: '🎁',
        color: '#f59e0b'
      }
    ]
  };

  // Rate limits configuration
  const rateLimitsConfig = {
    promo_activations_per_minute: 5,
    wheel_spins_per_day: 1
  };

  // Save configurations
  const configs = [
    { key: 'economy_config', value: economyConfig },
    { key: 'wheel_config', value: wheelConfig },
    { key: 'rewards_config', value: rewardsConfig },
    { key: 'rate_limits_config', value: rateLimitsConfig }
  ];

  for (const configData of configs) {
    const existingConfig = await configRepository.findOne({
      where: { key: configData.key }
    });

    if (!existingConfig) {
      const config = configRepository.create({
        key: configData.key,
        value: configData.value,
        updated_by_tg_id: 'system'
      });
      await configRepository.save(config);
      console.log(`✅ Created ${configData.key} configuration`);
    } else {
      console.log(`⏭️ ${configData.key} configuration already exists`);
    }
  }
}