import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, ShoppingBag, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../utils/api';
import toast from 'react-hot-toast';

interface Reward {
  id: string;
  name: string;
  description: string;
  petals_cost: number;
  discount_percent: number;
  discount_code: string;
  is_available: boolean;
  category: 'discount' | 'gift' | 'special';
}

interface ExchangeHistory {
  id: string;
  reward_name: string;
  petals_spent: number;
  discount_code: string;
  created_at: string;
  status: 'active' | 'used' | 'expired';
}

export const RewardsPage: React.FC = () => {
  const { balance, setBalance } = useStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<ExchangeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchanging, setExchanging] = useState<string | null>(null);

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      const [rewardsData, historyData] = await Promise.all([
        apiService.getRewards(),
        apiService.getRewardHistory()
      ]);
      setRewards(rewardsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load rewards data:', error);
      toast.error('Не удалось загрузить данные о наградах');
    } finally {
      setLoading(false);
    }
  };

  const exchangeReward = async (rewardId: string) => {
    try {
      setExchanging(rewardId);
      const result = await apiService.exchangeReward(rewardId);
      
      // Update balance
      if (balance) {
        setBalance({
          ...balance,
          petals: balance.petals - (rewards.find(r => r.id === rewardId)?.petals_cost || 0)
        });
      }
      
      // Reload data
      await loadRewardsData();
      
      toast.success(`Награда получена! Код: ${result.discount_code}`);
    } catch (error: any) {
      console.error('Failed to exchange reward:', error);
      toast.error(error.response?.data?.message || 'Не удалось обменять награду');
    } finally {
      setExchanging(null);
    }
  };

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'discount':
        return <ShoppingBag className="w-6 h-6" />;
      case 'gift':
        return <Gift className="w-6 h-6" />;
      case 'special':
        return <Star className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const getRewardColor = (category: string) => {
    switch (category) {
      case 'discount':
        return 'bg-blue-100 text-blue-600';
      case 'gift':
        return 'bg-pink-100 text-pink-600';
      case 'special':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'used':
        return 'text-gray-400 bg-gray-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'used':
        return 'Использован';
      case 'expired':
        return 'Истек';
      default:
        return 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 pt-8"
      >
        <h1 className="text-2xl font-bold text-white">Награды</h1>
        <p className="text-gray-400">Обменивай лепестки на скидки и подарки!</p>
      </motion.div>

      {/* Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card text-center"
      >
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-2xl">🌸</span>
          <span className="text-2xl font-bold text-white">{balance?.petals || 0}</span>
        </div>
        <p className="text-gray-400">Лепестков доступно</p>
      </motion.div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRewardColor(reward.category)}`}>
                {getRewardIcon(reward.category)}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRewardColor(reward.category)}`}>
                {reward.category === 'discount' && 'Скидка'}
                {reward.category === 'gift' && 'Подарок'}
                {reward.category === 'special' && 'Особый'}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{reward.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{reward.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🌸</span>
                <span className="font-semibold text-white">{reward.petals_cost}</span>
              </div>
              
              <motion.button
                whileHover={reward.is_available && (balance?.petals || 0) >= reward.petals_cost ? { scale: 1.05 } : {}}
                whileTap={reward.is_available && (balance?.petals || 0) >= reward.petals_cost ? { scale: 0.95 } : {}}
                onClick={() => exchangeReward(reward.id)}
                disabled={!reward.is_available || (balance?.petals || 0) < reward.petals_cost || exchanging === reward.id}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  reward.is_available && (balance?.petals || 0) >= reward.petals_cost && exchanging !== reward.id
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {exchanging === reward.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Обмен...</span>
                  </div>
                ) : (
                  'Обменять'
                )}
              </motion.button>
            </div>

            {!reward.is_available && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Временно недоступно</span>
                </div>
              </div>
            )}

            {(balance?.petals || 0) < reward.petals_cost && reward.is_available && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-700">
                  <span className="text-sm">Недостаточно лепестков</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Exchange History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">История обменов</h3>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Пока нет обменов</p>
            <p className="text-sm">Обменяй лепестки на награды!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{item.reward_name}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-400">-{item.petals_spent} 🌸</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  {item.status === 'active' && (
                    <div className="text-xs text-pink-600 mt-1 font-mono">
                      {item.discount_code}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

