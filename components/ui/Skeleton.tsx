import { View, ViewStyle, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.backgroundTertiary,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Skeleton height={160} borderRadius={16} />
      <Skeleton width="60%" height={20} />
      <Skeleton width="80%" height={16} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function SkeletonListItem() {
  return (
    <View style={{ flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' }}>
      <Skeleton width={56} height={56} borderRadius={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}