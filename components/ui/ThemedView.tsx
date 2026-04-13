import { View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'card';
}

export function ThemedView({ style, variant = 'default', ...props }: ThemedViewProps) {
  const theme = useTheme();
  
  const backgroundColor = {
    default: theme.background,
    secondary: theme.backgroundSecondary,
    card: theme.card,
  }[variant];

  return <View style={[{ backgroundColor }, style]} {...props} />;
}