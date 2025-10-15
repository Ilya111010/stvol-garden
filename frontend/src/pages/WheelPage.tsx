import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../utils/api';
import { WheelOfFortune } from '../components/WheelOfFortune';
import { SpinResult } from '../types';
import { telegram } from '../utils/telegram';
import toast from 'react-hot-toast';

export const WheelPage: React.FC = () => {
  const { 
    balance, 
    wheelPrizes, 
    isSpinning, 
    setWheelPrizes, 
    setSpinning, 
    setBalance,
  } = useStore();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWheelData();
  }, []);

  const loadWheelData = async () => {
    try {
      setLoading(true);
      
      const [balanceData, prizesData] = await Promise.all([
        apiService.getBalance(),
        apiService.getWheelConfig()
      ]);
      
      setBalance(balanceData);
      setWheelPrizes(prizesData);
    } catch (error) {
      console.error('Failed to load wheel data:', error);
      toast.error('Не удалось загрузить данные колеса');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async (): Promise<SpinResult> => {
    try {
      setSpinning(true);
      telegram.hapticFeedback('impact', 'heavy');
      
      const response = await apiService.spinWheel();
      
      if (response.success) {
        // Update balance
        if (response.new_balance) {
          setBalance(response.new_balance);
        }
        
        telegram.hapticFeedback('notification', 'success');
        toast.success(response.message);
        
        return response.result;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      telegram.hapticFeedback('notification', 'error');
      toast.error(error.message || 'Ошибка при вращении колеса');
      throw error;
    } finally {
      setSpinning(false);
    }
  };

  const formatTimeUntilNextSpin = (nextSpinDate: string) => {
    const now = new Date();
    const next = new Date(nextSpinDate);
    const diff = next.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}д ${hours}ч ${minutes}м`;
    } else if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    } else {
      return `${minutes}м`;
    }
  };

  if (loading) {
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
    <div className="min-h-screen">
      {/* Wheel */}
      <WheelOfFortune
        prizes={wheelPrizes}
        onSpin={handleSpin}
        canSpin={!!(balance?.can_spin && (balance?.spin_credits || 0) > 0)}
        isSpinning={isSpinning}
      />

      {/* Status and Rules */}
      <div className="px-4 space-y-4 pb-20">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Статус</h3>
            <Info size={20} className="text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">
                {balance?.spin_credits || 0}
              </div>
              <div className="text-sm text-gray-400">Доступно спинов</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {balance?.can_spin ? '✅' : '⏳'}
              </div>
              <div className="text-sm text-gray-400">
                {balance?.can_spin ? 'Можно крутить' : 'Кулдаун'}
              </div>
            </div>
          </div>

          {!balance?.can_spin && balance?.next_spin_available && (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-orange-400" />
                <span className="text-sm text-orange-300">
                  Следующий спин доступен через: {' '}
                  <span className="font-semibold">
                    {formatTimeUntilNextSpin(balance.next_spin_available)}
                  </span>
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Rules Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 space-y-4"
        >
          <h3 className="font-semibold text-white">Правила</h3>
          
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
              <span>Спины получают за активацию промокодов с заказов от 2000₽</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
              <span>Максимум 1 спин в наличии одновременно</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
              <span>Кулдаун между спинами: 14 дней</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
              <span>Призы: лепестки, скидки и подарки</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};