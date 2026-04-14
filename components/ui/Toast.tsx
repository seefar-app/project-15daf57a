import { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onDismiss }: ToastProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(
      type === 'success'
        ? Haptics.NotificationFeedbackType.Success
        : type === 'error'
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Warning
    );

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.success,
          icon: 'checkmark-circle' as const,
          iconColor: '#fff',
        };
      case 'error':
        return {
          backgroundColor: theme.error,
          icon: 'alert-circle' as const,
          iconColor: '#fff',
        };
      case 'warning':
        return {
          backgroundColor: theme.warning,
          icon: 'warning' as const,
          iconColor: '#fff',
        };
      case 'info':
        return {
          backgroundColor: theme.info,
          icon: 'information-circle' as const,
          iconColor: '#fff',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top + 16,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <Pressable
        onPress={handleDismiss}
        style={{
          backgroundColor: config.backgroundColor,
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: '500',
            color: '#fff',
          }}
          numberOfLines={2}
        >
          {message}
        </Text>
        <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
      </Pressable>
    </Animated.View>
  );
}