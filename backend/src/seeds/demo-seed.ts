import { DataSource } from 'typeorm';
import { Config } from '../entities/config.entity';
import { User } from '../entities/user.entity';
import { Balance } from '../entities/balance.entity';
import { PromoCode, PromoCodeType } from '../entities/promo-code.entity';

export async function seedDemoData(dataSource: DataSource) {
  console.log('🌱 Seeding demo data...');

  const configRepository = dataSource.getRepository(Config);
  const userRepository = dataSource.getRepository(User);
  const balanceRepository = dataSource.getRepository(Balance);
  const promoCodeRepository = dataSource.getRepository(PromoCode);

  // Create demo user
  const demoUser = userRepository.create({
    tg_id: '123456789',
    first_name: 'Demo',
    last_name: 'User',
    username: 'demo_user'
  });
  await userRepository.save(demoUser);

  // Create demo balance
  const demoBalance = balanceRepository.create({
    tg_id: '123456789',
    petals: 25,
    spin_credits: 1
  });
  await balanceRepository.save(demoBalance);

  // Create demo promo codes
  const demoPromoCodes = [
    {
      code: 'OR12345678AB',
      type: PromoCodeType.ORDER,
      petals_delta: 3,
      spin_credit: 1,
      labels_json: { order_amount: 2500 },
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      crc8_checksum: 'AB'
    },
    {
      code: 'SC87654321CD',
      type: PromoCodeType.SOCIAL,
      petals_delta: 5,
      spin_credit: 0,
      labels_json: { activity_type: 'story' },
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      crc8_checksum: 'CD'
    }
  ];

  for (const codeData of demoPromoCodes) {
    const promoCode = promoCodeRepository.create(codeData);
    await promoCodeRepository.save(promoCode);
  }

  // Create default configurations
  const economyConfig = {
    order_ranges: [
      { min_amount: 1500, max_amount: 1999, petals: 2, spins: 0 },
      { min_amount: 2000, max_amount: 2999, petals: 3, spins: 1 },
      { min_amount: 3000, max_amount: 4999, petals: 5, spins: 1 },
      { min_amount: 5000, max_amount: 9999, petals: 8, spins: 1 },
      { min_amount: 10000, max_amount: 999999, petals: 15, spins: 1 }
    ],
    social_activity: { petals_reward: 5, cooldown_days: 30 },
    referral: { inviter_petals: 3, invitee_petals: 6, min_order_amount: 2000, max_referrals_per_year: 20 }
  };

  const wheelConfig = {
    cooldown_days: 14,
    prizes: [
      { id: 'petals_2', type: 'petals', value: 2, label: '+2 лепестка', probability: 0.25, color: '#FFB6C1' },
      { id: 'petals_5', type: 'petals', value: 5, label: '+5 лепестков', probability: 0.20, color: '#FF69B4' },
      { id: 'discount_5', type: 'discount', value: 5, label: 'Скидка 5%', probability: 0.15, color: '#DDA0DD' },
      { id: 'petals_10', type: 'petals', value: 10, label: '+10 лепестков', probability: 0.15, color: '#FF1493' },
      { id: 'discount_10', type: 'discount', value: 10, label: 'Скидка 10%', probability: 0.10, color: '#BA55D3' },
      { id: 'gift_bouquet', type: 'gift', value: 1, label: 'Мини-букет', probability: 0.10, color: '#9370DB' },
      { id: 'petals_20', type: 'petals', value: 20, label: '+20 лепестков', probability: 0.04, color: '#8B008B' },
      { id: 'gift_large', type: 'gift', value: 2, label: 'Большой букет', probability: 0.01, color: '#4B0082' }
    ]
  };

  const rewardsConfig = {
    rewards: [
      { id: 'discount_5', name: 'Скидка 5%', description: 'Промокод на скидку 5%', petals_cost: 10, discount_percent: 5, max_discount_amount: 100, min_order_amount: 500, is_active: true, icon: '🏷️', color: '#10b981' },
      { id: 'discount_10', name: 'Скидка 10%', description: 'Промокод на скидку 10%', petals_cost: 20, discount_percent: 10, max_discount_amount: 200, min_order_amount: 1000, is_active: true, icon: '🎫', color: '#3b82f6' },
      { id: 'mini_bouquet', name: 'Мини-букет', description: 'Бесплатный мини-букет', petals_cost: 50, gift_type: 'mini_bouquet', is_active: true, icon: '💐', color: '#ec4899' }
    ]
  };

  const configs = [
    { key: 'economy_config', value: economyConfig },
    { key: 'wheel_config', value: wheelConfig },
    { key: 'rewards_config', value: rewardsConfig }
  ];

  for (const configData of configs) {
    const config = configRepository.create({
      key: configData.key,
      value: configData.value,
      updated_by_tg_id: 'system'
    });
    await configRepository.save(config);
  }

  console.log('✅ Demo data seeded successfully!');
  console.log('🎟️ Demo promo codes:');
  console.log('   ORDER: OR12345678AB (2500₽ order)');
  console.log('   SOCIAL: SC87654321CD (story activity)');
}

