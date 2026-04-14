import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  height = 4,
  color,
  backgroundColor,
  animated = true,
}: ProgressBarProps) {
  const theme = useTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: progress,
        tension: 50,
        friction: 8,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={{
        height,
        backgroundColor: backgroundColor || theme.border,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          width: widthInterpolated,
          backgroundColor: color || theme.primary,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}