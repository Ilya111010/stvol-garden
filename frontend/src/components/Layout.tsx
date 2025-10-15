import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Gift, 
  Zap, 
  Users, 
  Award,
  Settings,
  User
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

const tabs = [
  { id: 'home' as const, icon: Home, label: 'Главная' },
  { id: 'codes' as const, icon: Gift, label: 'Коды' },
  { id: 'wheel' as const, icon: Zap, label: 'Колесо' },
  { id: 'referrals' as const, icon: Users, label: 'Друзья' },
  { id: 'rewards' as const, icon: Award, label: 'Награды' },
  { id: 'profile' as const, icon: User, label: 'Профиль' },
  { id: 'admin' as const, icon: Settings, label: 'Админ' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌸</span>
              <h1 className="text-xl font-bold text-white">Stvol Garden</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 border border-gray-700">
                <span className="text-lg">🌸</span>
                <span className="font-semibold text-pink-400">24</span>
              </div>
              <div className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 border border-gray-700">
                <span className="text-lg">🎯</span>
                <span className="font-semibold text-green-400">1</span>
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

      {/* Main content */}
      <main className="relative z-10 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gray-900 border-t border-gray-800">
          <div className="flex justify-around items-center py-2 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
              <motion.button
                key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      // Add haptic feedback if available
                      if (window.Telegram?.WebApp?.HapticFeedback) {
                        window.Telegram.WebApp.HapticFeedback.selectionChanged();
                      }
                    }}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-green-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-green-500/20 rounded-xl -z-10"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <Icon 
                    size={22} 
                    className={`mb-1 ${isActive ? 'text-green-500' : 'text-gray-400'}`} 
                  />
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};