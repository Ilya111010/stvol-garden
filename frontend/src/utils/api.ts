import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Request interceptor to add Telegram auth
api.interceptors.request.use((config) => {
  if (window.Telegram?.WebApp?.initData) {
    config.headers.Authorization = `tma ${window.Telegram.WebApp.initData}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth endpoints
  async initUser(data: any) {
    const response = await api.post('/auth/init', data);
    return response.data;
  },

  // Balance endpoints
  async getBalance() {
    const response = await api.get('/balance');
    return response.data;
  },

  async getTransactionHistory() {
    const response = await api.get('/balance/history');
    return response.data;
  },

  // Promo codes endpoints
  async activatePromoCode(code: string) {
    const response = await api.post('/promo-codes/activate', { code });
    return response.data;
  },

  async createPromoCode(data: any) {
    const response = await api.post('/promo-codes/create', data);
    return response.data;
  },

  async getActivationHistory() {
    const response = await api.get('/promo-codes/history');
    return response.data;
  },

  // Wheel endpoints
  async getWheelConfig() {
    const response = await api.get('/wheel/config');
    return response.data;
  },

  async spinWheel() {
    const response = await api.post('/wheel/spin');
    return response.data;
  },

  // Referral endpoints
  async getReferrals() {
    const response = await api.get('/referral/list');
    return response.data;
  },

  async getReferralStats() {
    const response = await api.get('/referral/stats');
    return response.data;
  },

  async getReferralLink() {
    const response = await api.get('/referral/link');
    return response.data;
  },

  // Social endpoints
  async getSocialInstructions() {
    const response = await api.get('/social/instructions');
    return response.data;
  },

  async checkSocialEligibility() {
    const response = await api.get('/social/eligibility');
    return response.data;
  },

  async generateSocialPromo(type: string) {
    const response = await api.post(`/social/generate-promo?type=${type}`);
    return response.data;
  },

  // Rewards endpoints
  async getRewards() {
    const response = await api.get('/rewards/list');
    return response.data;
  },

  async exchangeReward(rewardId: string) {
    const response = await api.post('/rewards/exchange', { reward_id: rewardId });
    return response.data;
  },

  async getRewardHistory() {
    const response = await api.get('/rewards/history');
    return response.data;
  },

  // Referral endpoints
  confirmOrder: (data: { order_id: string }) => api.post('/referral/confirm-order', data),

  // Admin endpoints
  async getAnalytics(period: string) {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  async updateConfig(config: any) {
    const response = await api.put('/admin/config', config);
    return response.data;
  },

  async exportCsv(type: string) {
    const response = await api.get(`/admin/export/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;