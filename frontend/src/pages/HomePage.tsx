import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Zap, Users } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../utils/api';
import { PetalIcon } from '../components/PetalIcon';
import { telegram } from '../utils/telegram';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const { balance, setBalance, setLoading, isLoading } = useStore();

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const balanceData = await apiService.getBalance();
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to load balance:', error);
      toast.error('Не удалось загрузить баланс');
    } finally {
      setLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Добро пожаловать в
          </h1>
          <h2 className="text-3xl font-bold text-white">
            STVOL Garden <span className="text-pink-500">🌸</span>
          </h2>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="card p-6 text-center space-y-4 card-3d floating"
      >
        <div className="flex items-center justify-center space-x-3">
          <span className="text-4xl">🌸</span>
          <span className="text-4xl font-bold text-white">
            {balance?.petals || 24}
          </span>
        </div>
        <div className="text-gray-400">лепестка</div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <div className="text-white text-sm">
          До -5% скидки осталось 6 лепестков
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="bg-gradient-to-r from-pink-500 to-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            telegram.hapticFeedback('selection');
            useStore.getState().setActiveTab('codes');
          }}
            className="bg-pink-500 rounded-xl p-4 w-full border border-pink-500 hover:shadow-lg transition-all duration-200 button-3d glow-effect"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                Ввести промокод
              </h3>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            telegram.hapticFeedback('selection');
            useStore.getState().setActiveTab('wheel');
          }}
          className="bg-gradient-to-r from-pink-500 to-green-500 rounded-xl p-4 w-full border border-pink-500 hover:shadow-lg transition-all duration-200 button-3d shimmer"
          disabled={!balance?.can_spin}
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                Крутить колесо
              </h3>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            telegram.hapticFeedback('selection');
            useStore.getState().setActiveTab('referrals');
          }}
          className="bg-green-500 rounded-xl p-4 w-full border border-green-500 hover:shadow-lg transition-all duration-200 button-3d glow-effect"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                Пригласить друга
              </h3>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Recent Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-green-400 font-semibold mb-4">Последние действия</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white">PL-7K4D-9X3Z</span>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">+3 лепестка</span>
              <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Колесо</span>
            <div className="flex items-center space-x-2">
              <span className="text-pink-400">Бесплатная доставка</span>
              <span className="text-lg">🎉</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Welcome message for new users */}
      {(balance?.petals || 0) === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 text-center space-y-4 bg-gradient-to-r from-pink-50 to-rose-50"
        >
          <PetalIcon size={48} className="text-pink-500 mx-auto" animate />
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Добро пожаловать в Stvol Garden! 🌸
            </h3>
            <p className="text-gray-400 text-sm">
              Активируйте промокод с чека или поделитесь с друзьями, 
              чтобы получить первые лепестки
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};