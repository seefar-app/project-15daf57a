import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: theme.secondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Ionicons name={icon} size={60} color={theme.primary} />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: theme.text,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: theme.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
          marginBottom: 32,
        }}
      >
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} icon="arrow-forward" />
      )}
    </View>
  );
}