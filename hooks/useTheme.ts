import { Colors, ThemeColors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useTheme(): ThemeColors {
  const colorScheme = useColorScheme();
  return Colors[colorScheme];
}