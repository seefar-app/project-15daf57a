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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore, Language } from '@/store/useLanguageStore';

const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar' as Language, name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fr' as Language, name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageStore();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);

  const handleLanguageSelect = (languageCode: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguage(languageCode);

    // Check if RTL change is needed
    const needsRTLChange = (languageCode === 'ar') !== (currentLanguage === 'ar');

    if (needsRTLChange) {
      Alert.alert(
        t('language_restart_required'),
        t('language_restart_required'),
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
              // In production, use: RNRestart.Restart()
              Alert.alert('Demo Mode', 'In production, app would restart here');
              router.back();
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
      <LinearGradient
        colors={theme.gradient as unknown as string[]}
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
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
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityLabel={t('common_back')}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: '#fff',
              }}
            >
              {t('language_title')}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: 4,
              }}
            >
              {t('language_subtitle')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 12 }}>
          {languages.map((language) => {
            const isSelected = selectedLanguage === language.code;
            return (
              <Card
                key={language.code}
                variant="elevated"
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: isSelected ? theme.primaryLight : theme.secondary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>{language.flag}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: theme.text,
                      }}
                    >
                      {language.nativeName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {language.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: theme.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
        </View>

        {/* Info Card */}
        <Card
          variant="outline"
          style={{
            marginTop: 24,
            backgroundColor: theme.infoLight,
            borderColor: theme.info,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Ionicons name="information-circle" size={24} color={theme.info} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.text,
                  lineHeight: 20,
                }}
              >
                Changing to Arabic will enable right-to-left (RTL) layout. The app needs to restart for this change to take effect.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}