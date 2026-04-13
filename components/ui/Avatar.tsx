import { View, Image, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
  style?: ViewStyle;
}

export function Avatar({
  source,
  name,
  size = 'md',
  showStatus = false,
  status = 'online',
  style,
}: AvatarProps) {
  const theme = useTheme();

  const sizeValues = {
    sm: 32,
    md: 44,
    lg: 56,
    xl: 80,
  };

  const fontSizes = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
  };

  const statusSizes = {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 18,
  };

  const statusColors = {
    online: theme.success,
    offline: theme.textMuted,
    away: theme.warning,
  };

  const dimension = sizeValues[size];
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View style={[{ position: 'relative' }, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: theme.backgroundSecondary,
          }}
        />
      ) : (
        <View
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: fontSizes[size],
              fontWeight: '600',
              color: '#ffffff',
            }}
          >
            {initials}
          </Text>
        </View>
      )}
      {showStatus && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: statusSizes[size],
            height: statusSizes[size],
            borderRadius: statusSizes[size] / 2,
            backgroundColor: statusColors[status],
            borderWidth: 2,
            borderColor: theme.card,
          }}
        />
      )}
    </View>
  );
}