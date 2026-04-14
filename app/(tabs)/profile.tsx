import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  badge?: string;
  action?: () => void;
  color?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, currentLanguage, isRTL } = useTranslation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      t('profile_logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common_cancel'), style: 'cancel' },
        {
          text: t('profile_logout'),
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: t('profile_edit'),
          route: '/profile/edit',
        },
        {
          icon: 'location-outline',
          label: t('profile_addresses'),
          route: '/profile/addresses',
          badge: user?.savedAddresses.length.toString(),
        },
        {
          icon: 'heart-outline',
          label: t('profile_favorites'),
          route: '/profile/favorites',
          badge: user?.favoriteRestaurants.length.toString(),
        },
        {
          icon: 'card-outline',
          label: t('profile_payment'),
          route: '/profile/payment-methods',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'language-outline',
          label: t('profile_language'),
          route: '/profile/language',
          badge: currentLanguage.toUpperCase(),
        },
        {
          icon: 'notifications-outline',
          label: t('profile_notifications'),
          route: '/profile/notifications',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: t('profile_help'),
          route: '/profile/help',
        },
        {
          icon: 'information-circle-outline',
          label: t('profile_about'),
          route: '/profile/about',
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'log-out-outline',
          label: t('profile_logout'),
          action: handleLogout,
          color: theme.error,
        },
      ],
    },
  ];

  const handleMenuPress = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.action) {
      item.action();
    } else if (item.route) {
      router.push(item.route as any);
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
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#fff',
            marginBottom: 24,
          }}
        >
          {t('profile_title')}
        </Text>

        <Card variant="elevated" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Avatar
              source={{ uri: user?.avatar }}
              size={72}
              name={user?.name}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: theme.text,
                }}
              >
                {user?.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  marginTop: 2,
                }}
              >
                {user?.email}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <Ionicons name="wallet-outline" size={16} color={theme.primary} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.primary,
                  }}
                >
                  ${user?.wallet.toFixed(2)}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.textMuted,
                  }}
                >
                  {t('profile_wallet')}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/profile/edit')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.secondary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityLabel={t('profile_edit')}
              accessibilityRole="button"
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} />
            </Pressable>
          </View>
        </Card>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{ marginBottom: 24 }}>
            {section.title && (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.textMuted,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {section.title}
              </Text>
            )}
            <Card variant="elevated" padding="none">
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <Pressable
                    onPress={() => handleMenuPress(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      gap: 16,
                    }}
                    accessibilityLabel={item.label}
                    accessibilityRole="button"
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: item.color ? `${item.color}15` : theme.secondary,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.color || theme.primary}
                      />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: '500',
                        color: item.color || theme.text,
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.badge && (
                      <Badge label={item.badge} variant="secondary" />
                    )}
                    <Ionicons
                      name={isRTL ? 'chevron-back' : 'chevron-forward'}
                      size={20}
                      color={theme.textMuted}
                    />
                  </Pressable>
                  {itemIndex < section.items.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: theme.border,
                        marginLeft: 72,
                      }}
                    />
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        <Text
          style={{
            fontSize: 12,
            color: theme.textMuted,
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          Version 1.0.0 • Made with ❤️
        </Text>
      </ScrollView>
    </View>
  );
}