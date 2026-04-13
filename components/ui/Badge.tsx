import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', size = 'md', style }: BadgeProps) {
  const theme = useTheme();

  const variantColors = {
    default: { bg: theme.backgroundTertiary, text: theme.textSecondary },
    success: { bg: theme.successLight, text: theme.success },
    warning: { bg: theme.warningLight, text: theme.warning },
    error: { bg: theme.errorLight, text: theme.error },
    info: { bg: theme.infoLight, text: theme.info },
    primary: { bg: theme.secondary, text: theme.primary },
  };

  const sizeStyles = {
    sm: { paddingH: 8, paddingV: 4, fontSize: 10 },
    md: { paddingH: 12, paddingV: 6, fontSize: 12 },
  };

  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  return (
    <View
      style={[
        {
          backgroundColor: colors.bg,
          paddingHorizontal: sizes.paddingH,
          paddingVertical: sizes.paddingV,
          borderRadius: 20,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: sizes.fontSize,
          fontWeight: '600',
          color: colors.text,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Text>
    </View>
  );
}