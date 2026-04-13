import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'secondary' | 'muted' | 'primary';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function ThemedText({
  style,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  ...props
}: ThemedTextProps) {
  const theme = useTheme();

  const textColor = {
    default: theme.text,
    secondary: theme.textSecondary,
    muted: theme.textMuted,
    primary: theme.primary,
  }[variant];

  const fontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  }[size];

  const fontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }[weight];

  return (
    <Text
      style={[{ color: textColor, fontSize, fontWeight }, style]}
      {...props}
    />
  );
}