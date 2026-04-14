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

const { height } = Dimensions.get('window');

type AuthMode = 'login' | 'forgot-email' | 'forgot-code' | 'forgot-password' | 'forgot-success';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
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
      setLocalError('Please enter your email');
      showError('Please enter your email');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password');
      showError('Please enter your password');
      return;
    }

    const success = await login(email, password);
    if (success) {
      showSuccess('Welcome back!');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } else {
      showError(authError || 'Login failed. Please try again.');
    }
  };

  const handleSendResetCode = async () => {
    setLocalError('');
    
    if (!email.trim()) {
      setLocalError('Please enter your email');
      showError('Please enter your email');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    showSuccess('Reset code sent to your email');
    setMode('forgot-code');
  };

  const handleVerifyCode = async () => {
    setLocalError('');
    
    if (!resetCode.trim() || resetCode.length !== 6) {
      setLocalError('Please enter the 6-digit code');
      showError('Please enter the 6-digit code');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
    showSuccess('Code verified successfully');
    setMode('forgot-password');
  };

  const handleResetPassword = async () => {
    setLocalError('');
    
    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters');
      showError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      showError('Passwords do not match');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    showSuccess('Password reset successfully');
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
          title: 'Welcome Back',
          subtitle: 'Sign in to continue ordering',
          icon: 'restaurant' as const,
        };
      case 'forgot-email':
        return {
          title: 'Forgot Password?',
          subtitle: 'Enter your email to receive a reset code',
          icon: 'mail-outline' as const,
        };
      case 'forgot-code':
        return {
          title: 'Enter Code',
          subtitle: `We sent a code to ${email}`,
          icon: 'shield-checkmark-outline' as const,
        };
      case 'forgot-password':
        return {
          title: 'New Password',
          subtitle: 'Create a strong password',
          icon: 'lock-closed-outline' as const,
        };
      case 'forgot-success':
        return {
          title: 'Success!',
          subtitle: 'Your password has been reset',
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
                left: 16,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityLabel="Go back to login"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
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
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  accessibilityLabel="Email input"
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  accessibilityLabel="Password input"
                />

                <Pressable 
                  style={{ alignSelf: 'flex-end' }}
                  onPress={() => setMode('forgot-email')}
                  accessibilityLabel="Forgot password"
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.primary,
                      fontWeight: '500',
                    }}
                  >
                    Forgot Password?
                  </Text>
                </Pressable>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={isLoading}
                  fullWidth
                  size="lg"
                />

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 24,
                  }}
                >
                  <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                  <Text
                    style={{
                      marginHorizontal: 16,
                      color: theme.textMuted,
                      fontSize: 14,
                    }}
                  >
                    or continue with
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: theme.card,
                    }}
                    accessibilityLabel="Sign in with Google"
                    accessibilityRole="button"
                  >
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                    <Text style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>
                      Google
                    </Text>
                  </Pressable>
                  <Pressable
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: theme.card,
                    }}
                    accessibilityLabel="Sign in with Apple"
                    accessibilityRole="button"
                  >
                    <Ionicons name="logo-apple" size={20} color={theme.text} />
                    <Text style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>
                      Apple
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 24,
                  }}
                >
                  <Text style={{ color: theme.textSecondary }}>
                    Don't have an account?{' '}
                  </Text>
                  <Link href="/(auth)/signup" asChild>
                    <Pressable accessibilityLabel="Sign up" accessibilityRole="button">
                      <Text style={{ color: theme.primary, fontWeight: '600' }}>
                        Sign Up
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </>
            )}

            {mode === 'forgot-email' && (
              <>
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  accessibilityLabel="Email input for password reset"
                />

                <Button
                  title="Send Reset Code"
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
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  icon="shield-checkmark-outline"
                  accessibilityLabel="Verification code input"
                />

                <Pressable 
                  onPress={handleSendResetCode}
                  accessibilityLabel="Resend verification code"
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
                    Didn't receive the code? Resend
                  </Text>
                </Pressable>

                <Button
                  title="Verify Code"
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
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  accessibilityLabel="New password input"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  accessibilityLabel="Confirm password input"
                />

                <Button
                  title="Reset Password"
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
                    You can now sign in with your new password
                  </Text>
                </View>

                <Button
                  title="Back to Login"
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