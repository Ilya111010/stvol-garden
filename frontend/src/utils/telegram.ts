// Telegram WebApp utilities

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
      };
    };
  }
}

export class TelegramWebApp {
  private static instance: TelegramWebApp;
  private webApp: any;
  private isInitialized = false;

  private constructor() {
    this.webApp = window.Telegram?.WebApp;
  }

  static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp();
    }
    return TelegramWebApp.instance;
  }

  init(): void {
    if (this.isInitialized || !this.webApp) return;

    this.webApp.ready();
    this.webApp.expand();
    
    // Set theme colors for Stvol Garden
    this.webApp.headerColor = '#ec4899';
    this.webApp.backgroundColor = '#fef7f7';
    
    this.isInitialized = true;
  }

  getUser() {
    return this.webApp?.initDataUnsafe?.user;
  }

  getStartParam(): string | undefined {
    return this.webApp?.initDataUnsafe?.start_param;
  }

  isAvailable(): boolean {
    return !!this.webApp;
  }

  showMainButton(text: string, onClick: () => void): void {
    if (!this.webApp?.MainButton) return;

    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.show();
    this.webApp.MainButton.onClick(onClick);
  }

  hideMainButton(): void {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.hide();
  }

  hapticFeedback(type: 'impact' | 'notification' | 'selection', style?: string): void {
    if (!this.webApp?.HapticFeedback) return;

    switch (type) {
      case 'impact':
        this.webApp.HapticFeedback.impactOccurred(style || 'medium');
        break;
      case 'notification':
        this.webApp.HapticFeedback.notificationOccurred(style || 'success');
        break;
      case 'selection':
        this.webApp.HapticFeedback.selectionChanged();
        break;
    }
  }

  showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.webApp?.showAlert) {
        this.webApp.showAlert(message, resolve);
      } else {
        alert(message);
        resolve();
      }
    });
  }

  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp?.showConfirm) {
        this.webApp.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  }

  close(): void {
    if (this.webApp?.close) {
      this.webApp.close();
    }
  }
}

// Helper function to generate referral link
export function generateReferralLink(userId: number): string {
  return `https://t.me/stvol_gardenBot?start=ref_${userId}`;
}

// Helper function to check if user came from referral
export function parseStartParam(startParam?: string): { isReferral: boolean; referrerId?: number } {
  if (!startParam) return { isReferral: false };

  if (startParam.startsWith('ref_')) {
    const referrerId = parseInt(startParam.substring(4));
    return { isReferral: true, referrerId: isNaN(referrerId) ? undefined : referrerId };
  }

  return { isReferral: false };
}

export const telegram = TelegramWebApp.getInstance();