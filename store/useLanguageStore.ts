import { create } from 'zustand';
import { I18nManager } from 'react-native';

export type Language = 'en' | 'ar' | 'fr';

interface LanguageState {
  currentLanguage: Language;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: 'en',
  isRTL: false,

  setLanguage: (language: Language) => {
    const isRTL = language === 'ar';
    
    // Note: RTL changes require app restart in React Native
    // This is a known limitation - we'll show a message to users
    if (isRTL !== I18nManager.isRTL) {
      // In production, you'd want to:
      // 1. Save the preference
      // 2. Show restart prompt
      // 3. Use RNRestart.Restart() or similar
      console.log('RTL change requires app restart');
    }

    set({ currentLanguage: language, isRTL });
  },

  initializeLanguage: () => {
    // In production, load from AsyncStorage/SecureStore
    const savedLanguage = 'en' as Language;
    set({ currentLanguage: savedLanguage, isRTL: savedLanguage === 'ar' });
  },
}));