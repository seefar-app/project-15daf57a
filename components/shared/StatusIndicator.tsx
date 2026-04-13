import { View, Animated, ViewStyle } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface StatusIndicatorProps {
  status: 'online' | 'busy' | 'offline';
  size?: number;
  pulse?: boolean;
  style?: ViewStyle;
}

export function StatusIndicator({
  status,
  size = 12,
  pulse = true,
  style,
}: StatusIndicatorProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  const statusColors = {
    online: theme.success,
    busy: theme.warning,
    offline: theme.textMuted,
  };

  useEffect(() => {
    if (pulse && status === 'online') {
      const animation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.8,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [pulse, status]);

  return (
    <View style={[{ position: 'relative' }, style]}>
      {pulse && status === 'online' && (
        <Animated.View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: statusColors[status],
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        />
      )}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: statusColors[status],
        }}
      />
    </View>
  );
}