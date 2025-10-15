import { create } from 'zustand';
import { Balance, User, WheelPrize } from '../types';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Balance state
  balance: Balance | null;
  
  // Wheel state
  wheelPrizes: WheelPrize[];
  isSpinning: boolean;
  
  // UI state
  isLoading: boolean;
  activeTab: 'home' | 'codes' | 'wheel' | 'referrals' | 'rewards' | 'profile' | 'admin';
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (auth: boolean) => void;
  setBalance: (balance: Balance) => void;
  setWheelPrizes: (prizes: WheelPrize[]) => void;
  setSpinning: (spinning: boolean) => void;
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  updatePetals: (petals: number) => void;
  updateSpinCredits: (credits: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  balance: null,
  wheelPrizes: [],
  isSpinning: false,
  isLoading: false,
  activeTab: 'home',

  // Actions
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setBalance: (balance) => set({ balance }),
  setWheelPrizes: (wheelPrizes) => set({ wheelPrizes }),
  setSpinning: (isSpinning) => set({ isSpinning }),
  setLoading: (isLoading) => set({ isLoading }),
  setActiveTab: (activeTab) => set({ activeTab }),
  
  updatePetals: (petals) => {
    const { balance } = get();
    if (balance) {
      set({ balance: { ...balance, petals } });
    }
  },
  
  updateSpinCredits: (spin_credits) => {
    const { balance } = get();
    if (balance) {
      set({ balance: { ...balance, spin_credits } });
    }
  },
}));