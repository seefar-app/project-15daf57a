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
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';

const { height } = Dimensions.get('window');

type AuthMode = 'login' | 'forgot-email' | 'forgot-code' | 'forgot-password' | 'forgot-success';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, isRTL } = useTranslation();
  const { login, isLoading, authError } = useAuthStore();
  const { toast, hideToast, error: showError, success: showSuccess } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mode]);

  const handleLogin = async () => {
    setLocalError('');
    
    if (!email.trim()) {
      setLocalError(t('validation_email_required'));
      showError(t('validation_email_required'));
      return;
    }
    if (!password) {
      setLocalError(t('validation_password_required'));
      showError(t('validation_password_required'));
      return;
    }

    const success = await login(email, password);
    if (success) {
      showSuccess(t('toast_welcome_back'));
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } else {
      showError(authError || t('toast_login_failed'));
    }
  };

  const handleSendResetCode = async () => {
    setLocalError('');
    
    if (!email.trim()) {
      setLocalError(t('validation_email_required'));
      showError(t('validation_email_required'));
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    showSuccess(t('toast_code_sent'));
    setMode('forgot-code');
  };

  const handleVerifyCode = async () => {
    setLocalError('');
    
    if (!resetCode.trim() || resetCode.length !== 6) {
      setLocalError(t('validation_code_required'));
      showError(t('validation_code_required'));
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
    showSuccess(t('toast_code_verified'));
    setMode('forgot-password');
  };

  const handleResetPassword = async () => {
    setLocalError('');
    
    if (newPassword.length < 6) {
      setLocalError(t('validation_password_min'));
      showError(t('validation_password_min'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setLocalError(t('validation_passwords_match'));
      showError(t('validation_passwords_match'));
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    showSuccess(t('toast_password_reset'));
    setMode('forgot-success');
  };

  const handleBackToLogin = () => {
    setMode('login');
    setLocalError('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const getHeaderContent = () => {
    switch (mode) {
      case 'login':
        return {
          title: t('auth_welcome_back'),
          subtitle: t('auth_sign_in_subtitle'),
          icon: 'restaurant' as const,
        };
      case 'forgot-email':
        return {
          title: t('auth_forgot_title'),
          subtitle: t('auth_forgot_subtitle'),
          icon: 'mail-outline' as const,
        };
      case 'forgot-code':
        return {
          title: t('auth_enter_code'),
          subtitle: `${t('auth_code_sent_to')} ${email}`,
          icon: 'shield-checkmark-outline' as const,
        };
      case 'forgot-password':
        return {
          title: t('auth_new_password'),
          subtitle: t('auth_create_strong_password'),
          icon: 'lock-closed-outline' as const,
        };
      case 'forgot-success':
        return {
          title: t('auth_success_title'),
          subtitle: t('auth_password_reset_success'),
          icon: 'checkmark-circle-outline' as const,
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={hideToast}
        />
      )}

      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' }}
        style={{ height: height * 0.35 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(6, 182, 212, 0.8)', theme.background]}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            paddingHorizontal: 24,
            paddingBottom: 40,
          }}
        >
          {mode !== 'login' && (
            <Pressable
              onPress={handleBackToLogin}
              style={{
                position: 'absolute',
                top: insets.top + 12,
                [isRTL ? 'right' : 'left']: 16,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityLabel={t('common_back')}
              accessibilityRole="button"
            >
              <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#fff" />
            </Pressable>
          )}

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {mode !== 'login' && (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name={headerContent.icon} size={32} color="#fff" />
              </View>
            )}
            <Text
              style={{
                fontSize: mode === 'login' ? 36 : 32,
                fontWeight: '700',
                color: '#fff',
              }}
            >
              {headerContent.title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: 8,
              }}
            >
              {headerContent.subtitle}
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
              gap: 20,
            }}
          >
            {mode === 'login' && (
              <>
                <Input
                  label={t('auth_email')}
                  placeholder={t('auth_email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  accessibilityLabel={t('auth_email')}
                />

                <Input
                  label={t('auth_password')}
                  placeholder={t('auth_password')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  accessibilityLabel={t('auth_password')}
                />

                <Pressable 
                  style={{ alignSelf: isRTL ? 'flex-start' : 'flex-end' }}
                  onPress={() => setMode('forgot-email')}
                  accessibilityLabel={t('auth_forgot_password')}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.primary,
                      fontWeight: '500',
                    }}
                  >
                    {t('auth_forgot_password')}
                  </Text>
                </Pressable>

                <Button
                  title={t('auth_sign_in')}
                  onPress={handleLogin}
                  loading={isLoading}
                  fullWidth
                  size="lg"
                />

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 24,
                  }}
                >
                  <Text style={{ color: theme.textSecondary }}>
                    {t('auth_no_account')}{' '}
                  </Text>
                  <Link href="/(auth)/signup" asChild>
                    <Pressable accessibilityLabel={t('auth_sign_up')} accessibilityRole="button">
                      <Text style={{ color: theme.primary, fontWeight: '600' }}>
                        {t('auth_sign_up')}
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </>
            )}

            {mode === 'forgot-email' && (
              <>
                <Input
                  label={t('auth_email')}
                  placeholder={t('auth_email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  accessibilityLabel={t('auth_email')}
                />

                <Button
                  title={t('auth_send_code')}
                  onPress={handleSendResetCode}
                  loading={isProcessing}
                  fullWidth
                  size="lg"
                />
              </>
            )}

            {mode === 'forgot-code' && (
              <>
                <Input
                  label={t('auth_verification_code')}
                  placeholder={t('auth_enter_6_digit')}
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  icon="shield-checkmark-outline"
                  accessibilityLabel={t('auth_verification_code')}
                />

                <Pressable 
                  onPress={handleSendResetCode}
                  accessibilityLabel={t('auth_resend')}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.primary,
                      fontWeight: '500',
                      textAlign: 'center',
                    }}
                  >
                    {t('auth_didnt_receive')} {t('auth_resend')}
                  </Text>
                </Pressable>

                <Button
                  title={t('auth_verify_code')}
                  onPress={handleVerifyCode}
                  loading={isProcessing}
                  fullWidth
                  size="lg"
                />
              </>
            )}

            {mode === 'forgot-password' && (
              <>
                <Input
                  label={t('auth_new_password')}
                  placeholder={t('auth_new_password')}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  accessibilityLabel={t('auth_new_password')}
                />

                <Input
                  label={t('auth_confirm_password')}
                  placeholder={t('auth_confirm_password')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  accessibilityLabel={t('auth_confirm_password')}
                />

                <Button
                  title={t('auth_reset_password')}
                  onPress={handleResetPassword}
                  loading={isProcessing}
                  fullWidth
                  size="lg"
                />
              </>
            )}

            {mode === 'forgot-success' && (
              <>
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: 40,
                  }}
                >
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: theme.successLight,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 24,
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={60} color={theme.success} />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      color: theme.textSecondary,
                      textAlign: 'center',
                    }}
                  >
                    {t('auth_can_sign_in')}
                  </Text>
                </View>

                <Button
                  title={t('auth_back_to_login')}
                  onPress={handleBackToLogin}
                  fullWidth
                  size="lg"
                />
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}