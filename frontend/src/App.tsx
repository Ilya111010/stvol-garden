import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PromoCodesPage } from './pages/PromoCodesPage';
import { WheelPage } from './pages/WheelPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { RewardsPage } from './pages/RewardsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { useStore } from './store/useStore';
import { telegram } from './utils/telegram';
import { apiService } from './utils/api';

function App() {
  const { activeTab, setUser, setAuthenticated } = useStore();

  useEffect(() => {
    initializeApp();
  }, [setUser, setAuthenticated]);

  const initializeApp = async () => {
    // Initialize Telegram WebApp
    telegram.init();

    // Get user data from Telegram
    const telegramUser = telegram.getUser();
    if (telegramUser) {
      setUser({
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        language_code: telegramUser.language_code,
      });
      setAuthenticated(true);

      // Initialize user on backend
      try {
        const startParam = telegram.getStartParam();
        await apiService.initUser({ start_param: startParam });
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    }
  };

    const renderActiveTab = () => {
      switch (activeTab) {
        case 'home':
          return <HomePage />;
        case 'codes':
          return <PromoCodesPage />;
        case 'wheel':
          return <WheelPage />;
        case 'referrals':
          return <ReferralsPage />;
        case 'rewards':
          return <RewardsPage />;
        case 'profile':
          return <ProfilePage />;
        case 'admin':
          return <AdminPage />;
        default:
          return <HomePage />;
      }
    };

  return (
    <>
      <Layout>
        {renderActiveTab()}
      </Layout>
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            borderRadius: '16px',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#ec4899',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  );
}

export default App;