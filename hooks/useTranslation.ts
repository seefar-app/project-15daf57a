import { useLanguageStore } from '@/store/useLanguageStore';
import { translations, TranslationKey } from '@/constants/translations';

export function useTranslation() {
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = (key: TranslationKey): string => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  return { t, currentLanguage, isRTL };
}