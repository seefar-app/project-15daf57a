import { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={{ gap: 12 }}>
      <Skeleton height={180} borderRadius={16} />
      <View style={{ gap: 8 }}>
        <Skeleton width="70%" height={20} />
        <Skeleton width="50%" height={16} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <Skeleton width={60} height={16} />
          <Skeleton width={80} height={16} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={110} height={110} borderRadius={12} />
          <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
            <Skeleton width="80%" height={18} />
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}