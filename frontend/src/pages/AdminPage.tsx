import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Gift, 
  BarChart3, 
  Settings, 
  Plus, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../utils/api';
import toast from 'react-hot-toast';

interface AdminStats {
  total_users: number;
  total_petals_distributed: number;
  total_spins: number;
  active_promo_codes: number;
}

interface User {
  id: string;
  tg_id: string;
  first_name: string;
  last_name: string;
  username: string;
  created_at: string;
  petals: number;
  spin_credits: number;
}

interface PromoCode {
  id: string;
  code: string;
  type: 'ORDER' | 'SOCIAL' | 'REFERRAL' | 'REWARD';
  petals_delta: number;
  spin_credit: number;
  expires_at: string;
  used_at: string | null;
  created_by_tg_id: string;
}

export const AdminPage: React.FC = () => {
  const { user } = useStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'promocodes' | 'settings'>('overview');
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  // Form states
  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'ORDER' as 'ORDER' | 'SOCIAL' | 'REFERRAL' | 'REWARD',
    petals_delta: 0,
    spin_credit: 0,
    expires_days: 14
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd have admin-specific endpoints
      // For demo, we'll simulate the data
      setStats({
        total_users: 156,
        total_petals_distributed: 2840,
        total_spins: 89,
        active_promo_codes: 12
      });

      // Simulate users data
      setUsers([
        {
          id: '1',
          tg_id: '123456789',
          first_name: 'Demo',
          last_name: 'User',
          username: 'demouser',
          created_at: new Date().toISOString(),
          petals: 25,
          spin_credits: 1
        }
      ]);

      // Simulate promo codes data
      setPromoCodes([
        {
          id: '1',
          code: 'OR12345678AB',
          type: 'ORDER',
          petals_delta: 3,
          spin_credit: 1,
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          used_at: null,
          created_by_tg_id: 'admin'
        },
        {
          id: '2',
          code: 'SC87654321CD',
          type: 'SOCIAL',
          petals_delta: 5,
          spin_credit: 0,
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          used_at: null,
          created_by_tg_id: 'admin'
        }
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Не удалось загрузить данные админ панели');
    } finally {
      setLoading(false);
    }
  };

  const createPromoCode = async () => {
    try {
      // In a real app, you'd call the API
      const newCode: PromoCode = {
        id: Date.now().toString(),
        code: newPromo.code,
        type: newPromo.type,
        petals_delta: newPromo.petals_delta,
        spin_credit: newPromo.spin_credit,
        expires_at: new Date(Date.now() + newPromo.expires_days * 24 * 60 * 60 * 1000).toISOString(),
        used_at: null,
        created_by_tg_id: String(user?.id || 'admin')
      };

      setPromoCodes([...promoCodes, newCode]);
      setShowCreatePromo(false);
      setNewPromo({
        code: '',
        type: 'ORDER',
        petals_delta: 0,
        spin_credit: 0,
        expires_days: 14
      });
      toast.success('Промокод создан!');
    } catch (error) {
      toast.error('Не удалось создать промокод');
    }
  };

  const deletePromoCode = async (id: string) => {
    if (!confirm('Удалить промокод?')) return;
    
    try {
      setPromoCodes(promoCodes.filter(p => p.id !== id));
      toast.success('Промокод удален!');
    } catch (error) {
      toast.error('Не удалось удалить промокод');
    }
  };

  const exportData = async (type: 'users' | 'promocodes') => {
    try {
      const data = type === 'users' ? users : promoCodes;
      const csv = convertToCSV(data);
      downloadCSV(csv, `${type}_export.csv`);
      toast.success('Данные экспортированы!');
    } catch (error) {
      toast.error('Не удалось экспортировать данные');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <h1 className="text-2xl font-bold text-white">Админ панель</h1>
        <p className="text-gray-400">Управление системой Stvol Garden</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 bg-gray-800 p-1 rounded-xl"
      >
        {[
          { id: 'overview', label: 'Обзор', icon: BarChart3 },
          { id: 'users', label: 'Пользователи', icon: Users },
          { id: 'promocodes', label: 'Промокоды', icon: Gift },
          { id: 'settings', label: 'Настройки', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-white">{stats?.total_users || 0}</div>
              <div className="text-sm text-gray-400">Пользователей</div>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌸</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats?.total_petals_distributed || 0}</div>
              <div className="text-sm text-gray-400">Лепестков выдано</div>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats?.total_spins || 0}</div>
              <div className="text-sm text-gray-400">Спинов</div>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-white">{stats?.active_promo_codes || 0}</div>
              <div className="text-sm text-gray-400">Активных промокодов</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Быстрые действия</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('promocodes')}
                className="p-4 bg-pink-50 hover:bg-pink-100 rounded-xl border border-pink-200 transition-colors"
              >
                <Plus className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <div className="font-medium text-white">Создать промокод</div>
                <div className="text-sm text-gray-400">Добавить новый промокод</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => exportData('users')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
              >
                <Download className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-white">Экспорт пользователей</div>
                <div className="text-sm text-gray-400">Скачать CSV файл</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('users')}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors"
              >
                <Eye className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-white">Просмотр пользователей</div>
                <div className="text-sm text-gray-400">Управление аккаунтами</div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Пользователи</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => exportData('users')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Экспорт</span>
            </motion.button>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Пользователь</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Telegram ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Лепестки</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Спины</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Регистрация</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-pink-600 font-semibold text-sm">
                              {user.first_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-400">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400 font-mono">{user.tg_id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">🌸</span>
                          <span className="font-medium">{user.petals}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">🎯</span>
                          <span className="font-medium">{user.spin_credits}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Promo Codes Tab */}
      {activeTab === 'promocodes' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Промокоды</h3>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => exportData('promocodes')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Экспорт</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreatePromo(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Создать</span>
              </motion.button>
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Код</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Тип</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Лепестки</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Спины</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Статус</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map((promo) => (
                    <tr key={promo.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">{promo.code}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          promo.type === 'ORDER' ? 'bg-blue-100 text-blue-600' :
                          promo.type === 'SOCIAL' ? 'bg-green-100 text-green-600' :
                          promo.type === 'REFERRAL' ? 'bg-purple-100 text-purple-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {promo.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">🌸</span>
                          <span className="font-medium">{promo.petals_delta}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">🎯</span>
                          <span className="font-medium">{promo.spin_credit}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          promo.used_at ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {promo.used_at ? 'Использован' : 'Активен'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => deletePromoCode(promo.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Настройки системы</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-white">Базовая награда за заказ</div>
                  <div className="text-sm text-gray-400">Лепестки за подтвержденный заказ</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🌸</span>
                  <span className="font-medium">3</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-white">Награда за социальную активность</div>
                  <div className="text-sm text-gray-400">Лепестки за активность в соцсетях</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🌸</span>
                  <span className="font-medium">5</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-white">Реферальный бонус</div>
                  <div className="text-sm text-gray-400">Лепестки за приглашенного друга</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🌸</span>
                  <span className="font-medium">10</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Promo Modal */}
      {showCreatePromo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setShowCreatePromo(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Создать промокод</h3>
              <button
                onClick={() => setShowCreatePromo(false)}
                className="p-1 text-gray-400 hover:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Код</label>
                <input
                  type="text"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                  className="input-field"
                  placeholder="Введите код промокода"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                <select
                  value={newPromo.type}
                  onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="ORDER">Заказ</option>
                  <option value="SOCIAL">Социальная активность</option>
                  <option value="REFERRAL">Реферал</option>
                  <option value="REWARD">Награда</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Лепестки</label>
                  <input
                    type="number"
                    value={newPromo.petals_delta}
                    onChange={(e) => setNewPromo({ ...newPromo, petals_delta: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Спины</label>
                  <input
                    type="number"
                    value={newPromo.spin_credit}
                    onChange={(e) => setNewPromo({ ...newPromo, spin_credit: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Срок действия (дни)</label>
                <input
                  type="number"
                  value={newPromo.expires_days}
                  onChange={(e) => setNewPromo({ ...newPromo, expires_days: parseInt(e.target.value) || 14 })}
                  className="input-field"
                  placeholder="14"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreatePromo(false)}
                className="flex-1 btn-secondary"
              >
                Отмена
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createPromoCode}
                className="flex-1 btn-primary"
              >
                Создать
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

