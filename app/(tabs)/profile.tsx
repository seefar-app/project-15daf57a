import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Animated, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, rightElement, danger }: MenuItemProps) {
  const theme = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderLight,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: danger ? theme.errorLight : theme.secondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? theme.error : theme.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: danger ? theme.error : theme.text,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={theme.gradient as unknown as string[]}
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 60,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>
            Profile
          </Text>
          <Pressable
            onPress={() => router.push('/profile/edit')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="create-outline" size={22} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        style={{ marginTop: -40 }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Profile Card */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Avatar source={user?.avatar} name={user?.name} size="xl" />
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: theme.text,
                  marginTop: 16,
                }}
              >
                {user?.name}
              </Text>
              <Text
                style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}
              >
                {user?.email}
              </Text>
              
              {/* Stats */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: theme.borderLight,
                  width: '100%',
                }}
              >
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{ fontSize: 22, fontWeight: '700', color: theme.primary }}
                  >
                    ${user?.wallet?.toFixed(2) || '0.00'}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                    Wallet
                  </Text>
                </View>
                <View
                  style={{ width: 1, backgroundColor: theme.borderLight, marginVertical: 4 }}
                />
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{ fontSize: 22, fontWeight: '700', color: theme.primary }}
                  >
                    {user?.favoriteRestaurants?.length || 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                    Favorites
                  </Text>
                </View>
                <View
                  style={{ width: 1, backgroundColor: theme.borderLight, marginVertical: 4 }}
                />
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{ fontSize: 22, fontWeight: '700', color: theme.primary }}
                  >
                    {user?.savedAddresses?.length || 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                    Addresses
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Account Section */}
          <Card style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Account
            </Text>
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => router.push('/profile/edit')}
            />
            <MenuItem
              icon="location-outline"
              title="Saved Addresses"
              subtitle={`${user?.savedAddresses?.length || 0} addresses saved`}
              onPress={() => router.push('/profile/addresses')}
            />
            <MenuItem
              icon="card-outline"
              title="Payment Methods"
              subtitle="Manage your payment options"
              onPress={() => router.push('/profile/payment-methods')}
            />
            <MenuItem
              icon="heart-outline"
              title="Favorites"
              subtitle="View your favorite restaurants"
              onPress={() => router.push('/profile/favorites')}
            />
          </Card>

          {/* Preferences Section */}
          <Card style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Preferences
            </Text>
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Order updates, promotions"
              rightElement={
                <Switch
                  value={true}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={theme.primary}
                />
              }
            />
            <MenuItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Follow system settings"
              rightElement={
                <Switch
                  value={false}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={theme.primary}
                />
              }
            />
            <MenuItem
              icon="language-outline"
              title="Language"
              subtitle="English"
            />
          </Card>

          {/* Support Section */}
          <Card style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Support
            </Text>
            <MenuItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="FAQs and support articles"
            />
            <MenuItem
              icon="chatbubble-outline"
              title="Contact Us"
              subtitle="Get in touch with our team"
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms & Privacy"
              subtitle="Legal information"
            />
          </Card>

          {/* Logout */}
          <Card>
            <MenuItem
              icon="log-out-outline"
              title="Logout"
              onPress={handleLogout}
              danger
            />
          </Card>

          {/* Version */}
          <Text
            style={{
              textAlign: 'center',
              color: theme.textMuted,
              fontSize: 12,
              marginTop: 24,
            }}
          >
            FoodDash v1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}