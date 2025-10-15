import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Gift, 
  Settings, 
  FileText, 
  LogOut, 
  Leaf, 
  User,
  Ticket,
  Award,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../utils/api';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, balance, setActiveTab } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Load user data if needed
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout
    toast.success('Выход выполнен');
  };

  const handleStaffMode = () => {
    // TODO: Implement staff mode
    toast('Режим персонала будет добавлен');
  };

  const handleAdminPanel = () => {
    setActiveTab('admin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('home')}
                className="p-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <span className="text-white text-sm">Назад</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 border border-gray-700">
                <span className="text-lg">🌸</span>
                <span className="font-semibold text-pink-400">{balance?.petals || 24}</span>
              </div>
              <div className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 border border-gray-700">
                <span className="text-lg">🎯</span>
                <span className="font-semibold text-green-400">{balance?.spin_credits || 1}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                REFERRAL
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          {/* Avatar */}
          <div className="relative mx-auto w-24 h-24 floating">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-green-500 p-1 glow-effect">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* User Info */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {user?.first_name || 'Пользователь'}
            </h1>
            <p className="text-gray-400">Роль: Покупатель</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="card text-center p-4 card-3d">
            <div className="text-2xl font-bold text-white mb-1">
              {balance?.petals || 24}
            </div>
            <div className="text-sm text-gray-400">Лепестки</div>
          </div>
          
          <div className="card text-center p-4 card-3d">
            <div className="text-2xl font-bold text-white mb-1">4/10</div>
            <div className="text-sm text-gray-400">Прогресс</div>
          </div>
          
          <div className="card text-center p-4 card-3d">
            <div className="text-2xl font-bold text-white mb-1">
              {balance?.spin_credits || 1}/1
            </div>
            <div className="text-sm text-gray-400">Спины</div>
          </div>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('codes')}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 button-3d"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-white font-medium">Ввести промокод</span>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('rewards')}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 button-3d"
          >
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-white font-medium">Обменять награды</span>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </motion.button>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 button-3d"
          >
            <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-white font-medium">Настройки</span>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 button-3d"
          >
            <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-white font-medium">Политика конфиденциальности</span>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 button-3d"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400 font-medium">Выйти</span>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </motion.button>
        </motion.div>

        {/* Special Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStaffMode}
            className="w-full bg-green-500 hover:bg-green-600 rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 button-3d glow-effect"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-medium">Режим персонала</span>
            <ChevronRight className="w-5 h-5 text-white/70 ml-auto" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdminPanel}
            className="w-full bg-pink-500 hover:bg-pink-600 rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 button-3d shimmer"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-medium">Панель администратора</span>
            <ChevronRight className="w-5 h-5 text-white/70 ml-auto" />
          </motion.button>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-50"
      >
        <span className="text-sm font-medium">Edit App</span>
      </motion.button>
    </div>
  );
};
