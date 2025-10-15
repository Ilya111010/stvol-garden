import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Camera, Check, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../utils/api';
import { Transaction } from '../types';
import { PetalIcon } from '../components/PetalIcon';
import { telegram } from '../utils/telegram';
import toast from 'react-hot-toast';

export const PromoCodesPage: React.FC = () => {
  const { setBalance } = useStore();
  const [code, setCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [showHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyData = await apiService.getActivationHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleActivateCode = async () => {
    if (!code.trim()) {
      toast.error('Введите промокод');
      return;
    }

    try {
      setIsActivating(true);
      telegram.hapticFeedback('impact', 'medium');
      
      const response = await apiService.activatePromoCode(code.trim().toUpperCase());
      
      if (response.success) {
        telegram.hapticFeedback('notification', 'success');
        toast.success(response.message);
        
        // Update balance
        if (response.new_balance) {
          setBalance(response.new_balance);
        }
        
        // Clear input and reload history
        setCode('');
        loadHistory();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      telegram.hapticFeedback('notification', 'error');
      toast.error(error.response?.data?.message || error.message || 'Ошибка активации');
    } finally {
      setIsActivating(false);
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'PROMO_ACTIVATION':
        return 'Промокод';
      case 'SOCIAL_ACTIVITY':
        return 'Соцсети';
      case 'REFERRAL_BONUS':
        return 'Реферал';
      case 'WHEEL_WIN':
        return 'Колесо';
      case 'REWARD_EXCHANGE':
        return 'Обмен';
      default:
        return type;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PROMO_ACTIVATION':
        return '🎟️';
      case 'SOCIAL_ACTIVITY':
        return '📱';
      case 'REFERRAL_BONUS':
        return '👥';
      case 'WHEEL_WIN':
        return '🎡';
      case 'REWARD_EXCHANGE':
        return '🎁';
      default:
        return '💎';
    }
  };

  const scanQRCode = () => {
    // TODO: Implement QR code scanning
    telegram.showAlert('Функция сканирования QR-кода будет добавлена в следующем обновлении');
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-2xl font-bold text-white">Введите ваш промокод</h1>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-pink-500">🌸</span>
        </div>
      </motion.div>

      {!showHistory ? (
        <>
          {/* Activation Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-6 space-y-6 card-3d"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Активировать промокод
              </h2>
              <p className="text-gray-400 text-sm">
                Введите код с чека или из соцсетей
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Введите промокод"
                  className="input-field pr-12 text-center font-mono text-lg tracking-wider"
                  maxLength={16}
                />
                <button
                  onClick={scanQRCode}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Camera size={20} className="text-gray-500" />
                </button>
              </div>

              <motion.button
                onClick={handleActivateCode}
                disabled={!code.trim() || isActivating}
                whileHover={code.trim() && !isActivating ? { scale: 1.02 } : {}}
                whileTap={code.trim() && !isActivating ? { scale: 0.98 } : {}}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  code.trim() && !isActivating
                        ? 'bg-pink-500 text-white shadow-lg hover:shadow-xl glow-effect'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isActivating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Активация...</span>
                  </div>
                ) : (
                  'Активировать'
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4"
          >
            <div className="glass-card p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🧾</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Промокоды с чеков</h3>
                  <p className="text-sm text-gray-400">
                    За покупки от 1500₽ получайте лепестки и спины
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Социальные активности</h3>
                  <p className="text-sm text-gray-400">
                    Отметки в сторис дают +5 лепестков (раз в 30 дней)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        /* History View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-4">
            <h3 className="font-semibold text-gray-800 mb-4">История активаций</h3>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Пока нет активированных промокодов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                        <span className="text-lg">
                          {getTransactionIcon(transaction.type)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {formatTransactionType(transaction.type)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(transaction.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? <Check size={16} /> : <X size={16} />}
                        <PetalIcon size={16} className="text-pink-500" />
                        <span className="font-semibold">
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};