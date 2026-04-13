import { View, Pressable, ViewStyle, Animated } from 'react-native';
import { useRef, ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const getCardStyle = (): ViewStyle => {
    const paddingValues = {
      none: 0,
      sm: 12,
      md: 16,
      lg: 24,
    };

    const baseStyle: ViewStyle = {
      borderRadius: 16,
      padding: paddingValues[padding],
      backgroundColor: theme.card,
      overflow: 'hidden',
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
      elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
      },
      outline: {
        borderWidth: 1,
        borderColor: theme.border,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const cardContent = (
    <Animated.View style={[getCardStyle(), { transform: [{ scale: scaleAnim }] }, style]}>
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}