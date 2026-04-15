import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { useLanguageStore, Language } from '@/store/useLanguageStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, currentLanguage, isRTL } = useTranslation();
  const { setLanguage } = useLanguageStore();

  const handleLanguageSelect = (languageCode: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newIsRTL = languageCode === 'ar';
    const currentIsRTL = currentLanguage === 'ar';

    if (newIsRTL !== currentIsRTL) {
      Alert.alert(
        t('language_restart_required'),
        'The app needs to restart for RTL changes to take effect.',
        [
          {
            text: t('language_restart_later'),
            style: 'cancel',
            onPress: () => {
              setLanguage(languageCode);
              router.back();
            },
          },
          {
            text: t('language_restart_now'),
            onPress: () => {
              setLanguage(languageCode);
              // In production, use: Updates.reloadAsync() from expo-updates
              Alert.alert('Restart Required', 'Please close and reopen the app.');
            },
          },
        ]
      );
    } else {
      setLanguage(languageCode);
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.secondary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityLabel={t('common_back')}
            accessibilityRole="button"
          >
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={24}
              color={theme.primary}
            />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: theme.text,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('language_title')}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.textSecondary,
                marginTop: 2,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('language_subtitle')}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" padding="none">
          {languages.map((language, index) => (
            <View key={language.code}>
              <Pressable
                onPress={() => handleLanguageSelect(language.code)}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16,
                  gap: 16,
                }}
                accessibilityLabel={`${language.name} - ${language.nativeName}`}
                accessibilityRole="button"
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: theme.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{language.flag}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.text,
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {language.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.textSecondary,
                      marginTop: 2,
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {language.nativeName}
                  </Text>
                </View>
                {currentLanguage === language.code && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                )}
              </Pressable>
              {index < languages.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.border,
                    marginLeft: isRTL ? 0 : 80,
                    marginRight: isRTL ? 80 : 0,
                  }}
                />
              )}
            </View>
          ))}
        </Card>

        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: theme.secondary,
            borderRadius: 12,
          }}
        >
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              gap: 12,
            }}
          >
            <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.text,
                  lineHeight: 20,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('language_restart_required')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}