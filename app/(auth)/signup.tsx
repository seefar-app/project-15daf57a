import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

const { height } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, isRTL } = useTranslation();
  const { signup, isLoading, authError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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

  const handleSignup = async () => {
    setLocalError('');

    if (!firstName.trim()) {
      setLocalError('Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      setLocalError('Please enter your last name');
      return;
    }
    if (!email.trim()) {
      setLocalError(t('validation_email_required'));
      return;
    }
    if (!phone.trim()) {
      setLocalError('Please enter your phone number');
      return;
    }
    if (password.length < 6) {
      setLocalError(t('validation_password_min'));
      return;
    }

    // Combine first and last name for the signup function
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const success = await signup(fullName, email, phone, password);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const displayError = localError || authError;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800' }}
        style={{ height: height * 0.3 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(6, 182, 212, 0.8)', theme.background]}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            paddingHorizontal: 24,
            paddingBottom: 32,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: insets.top + 12,
              [isRTL ? 'right' : 'left']: 16,
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
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#fff" />
          </Pressable>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: '#fff',
              }}
            >
              {t('auth_create_account') || 'Create Account'}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: 6,
              }}
            >
              {t('auth_join_subtitle') || 'Join FoodDash and start ordering'}
            </Text>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              gap: 16,
            }}
          >
            <Input
              label="first_name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              icon="person-outline"
              accessibilityLabel="First Name"
            />

            <Input
              label="last_name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              icon="person-outline"
              accessibilityLabel="Last Name"
            />

            <Input
              label="email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              accessibilityLabel="Email"
            />

            <Input
              label="phone"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="call-outline"
              accessibilityLabel="Phone Number"
            />

            <Input
              label="password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
              accessibilityLabel="Password"
            />

            {displayError && (
              <View
                style={{
                  backgroundColor: theme.errorLight,
                  padding: 12,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="alert-circle" size={20} color={theme.error} />
                <Text style={{ color: theme.error, flex: 1 }}>{displayError}</Text>
              </View>
            )}

            <Text
              style={{
                fontSize: 12,
                color: theme.textMuted,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {t('auth_terms_prefix') || 'By signing up, you agree to our'}{' '}
              <Text style={{ color: theme.primary }}>
                {t('auth_terms') || 'Terms of Service'}
              </Text>{' '}
              {t('auth_and') || 'and'}{' '}
              <Text style={{ color: theme.primary }}>
                {t('auth_privacy') || 'Privacy Policy'}
              </Text>
            </Text>

            <Button
              title={t('auth_create_account') || 'Create Account'}
              onPress={handleSignup}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 20,
              }}
            >
              <Text style={{ color: theme.textSecondary }}>
                {t('auth_have_account') || 'Already have an account?'}{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable accessibilityLabel={t('auth_sign_in')} accessibilityRole="button">
                  <Text style={{ color: theme.primary, fontWeight: '600' }}>
                    {t('auth_sign_in')}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}