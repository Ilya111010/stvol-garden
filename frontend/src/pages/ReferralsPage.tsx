import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Share2, Gift, Copy, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../utils/api';
import toast from 'react-hot-toast';

interface ReferralStats {
  total_referrals: number;
  confirmed_orders: number;
  total_bonus_earned: number;
  referral_link: string;
}

interface Referral {
  id: string;
  invitee_tg_id: string;
  invitee_name: string;
  created_at: string;
  first_order_confirmed_at: string | null;
  bonus_paid: boolean;
}

export const ReferralsPage: React.FC = () => {
  const { user } = useStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demo
      const mockStats: ReferralStats = {
        total_referrals: 2,
        confirmed_orders: 1,
        total_bonus_earned: 10,
        referral_link: 't.me/stvol_garden_bot?start=ref_72841'
      };
      
      const mockReferrals: Referral[] = [
        {
          id: '1',
          invitee_tg_id: '987654321',
          invitee_name: 'Sofia',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          first_order_confirmed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          bonus_paid: true
        },
        {
          id: '2',
          invitee_tg_id: '123456789',
          invitee_name: 'Artem',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          first_order_confirmed_at: null,
          bonus_paid: false
        }
      ];
      
      setStats(mockStats);
      setReferrals(mockReferrals);
    } catch (error) {
      console.error('Failed to load referral data:', error);
      toast.error('Не удалось загрузить данные о рефералах');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!stats?.referral_link) return;
    
    try {
      await navigator.clipboard.writeText(stats.referral_link);
      setCopied(true);
      toast.success('Ссылка скопирована!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const shareReferralLink = async () => {
    if (!stats?.referral_link) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Присоединяйся к Stvol Garden!',
          text: 'Получи бонусы за покупки цветов!',
          url: stats.referral_link
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyReferralLink();
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
        <h1 className="text-2xl font-bold text-white">Друзья</h1>
        <p className="text-gray-400">Приглашай друзей и получай бонусы!</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total_referrals || 0}</div>
          <div className="text-sm text-gray-400">Всего приглашений</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.confirmed_orders || 0}</div>
          <div className="text-sm text-gray-400">Подтвержденных заказов</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🌸</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total_bonus_earned || 0}</div>
          <div className="text-sm text-gray-400">Лепестков заработано</div>
        </motion.div>
      </div>

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Твоя реферальная ссылка</h3>
        <div className="flex items-center space-x-3">
          <div className="flex-1 p-3 bg-gray-800 rounded-xl border border-gray-700 text-sm font-mono text-gray-300 break-all">
            {stats?.referral_link || 'Загрузка...'}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyReferralLink}
            className="p-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-xl transition-colors"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-pink-400" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareReferralLink}
            className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-colors"
          >
            <Share2 className="w-5 h-5 text-blue-400" />
          </motion.button>
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Как это работает</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
            <div>
              <div className="font-medium text-white">Поделись ссылкой</div>
              <div className="text-sm text-gray-400">Отправь другу свою реферальную ссылку</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
            <div>
              <div className="font-medium text-white">Друг делает заказ</div>
              <div className="text-sm text-gray-400">Твой друг регистрируется и делает первый заказ</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
            <div>
              <div className="font-medium text-white">Получаешь бонус</div>
              <div className="text-sm text-gray-400">Ты получаешь 10 лепестков за каждого друга!</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Referrals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Твои рефералы</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Пока нет приглашенных друзей</p>
            <p className="text-sm">Поделись ссылкой и пригласи друзей!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral, index) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <span className="text-pink-400 font-semibold">
                      {referral.invitee_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {referral.invitee_name || 'Анонимный пользователь'}
                    </div>
                    <div className="text-sm text-gray-400">
                      Приглашен {new Date(referral.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {referral.first_order_confirmed_at ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-400 font-medium">Заказ подтвержден</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-400">Ожидает заказ</span>
                    </div>
                  )}
                  {referral.bonus_paid && (
                    <div className="text-xs text-pink-400 mt-1">+10 🌸</div>
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

