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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

const { height } = Dimensions.get('window');

type Step = 'email' | 'code' | 'password' | 'success';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
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
  }, [step]);

  const handleSendCode = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('code');
  };

  const handleVerifyCode = async () => {
    setError('');
    
    if (!code.trim() || code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('password');
  };

  const handleResetPassword = async () => {
    setError('');
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('success');
  };

  const getStepContent = () => {
    switch (step) {
      case 'email':
        return {
          title: 'Forgot Password?',
          subtitle: 'Enter your email to receive a reset code',
          icon: 'mail-outline' as const,
        };
      case 'code':
        return {
          title: 'Enter Code',
          subtitle: `We sent a code to ${email}`,
          icon: 'shield-checkmark-outline' as const,
        };
      case 'password':
        return {
          title: 'New Password',
          subtitle: 'Create a strong password',
          icon: 'lock-closed-outline' as const,
        };
      case 'success':
        return {
          title: 'Success!',
          subtitle: 'Your password has been reset',
          icon: 'checkmark-circle-outline' as const,
        };
    }
  };

  const content = getStepContent();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
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
          <Pressable
            onPress={() => step === 'email' ? router.back() : setStep('email')}
            style={{
              position: 'absolute',
              top: insets.top + 12,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
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
              <Ionicons name={content.icon} size={32} color="#fff" />
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: '#fff',
              }}
            >
              {content.title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: 8,
              }}
            >
              {content.subtitle}
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
            {step === 'email' && (
              <>
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                />
                <Button
                  title="Send Reset Code"
                  onPress={handleSendCode}
                  loading={isLoading}
                  fullWidth
                  size="lg"
                />
              </>
            )}

            {step === 'code' && (
              <>
                <Input
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  icon="shield-checkmark-outline"
                />
                <Pressable onPress={handleSendCode}>
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
                  loading={isLoading}
                  fullWidth
                  size="lg"
                />
              </>
            )}

            {step === 'password' && (
              <>
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                />
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                />
                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  fullWidth
                  size="lg"
                />
              </>
            )}

            {step === 'success' && (
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
                  onPress={() => router.replace('/(auth)/login')}
                  fullWidth
                  size="lg"
                />
              </>
            )}

            {error && step !== 'success' && (
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
                <Text style={{ color: theme.error, flex: 1 }}>{error}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}