import { View, TextInput, Text, Pressable, TextInputProps, ViewStyle } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = secureTextEntry && !showPassword;

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.textSecondary,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: error ? theme.error : isFocused ? theme.primary : theme.border,
          borderRadius: 12,
          backgroundColor: theme.backgroundSecondary,
          paddingHorizontal: 16,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? theme.primary : theme.textMuted}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          {...props}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={theme.textMuted}
          style={[
            {
              flex: 1,
              paddingVertical: 14,
              fontSize: 16,
              color: theme.text,
            },
            props.style,
          ]}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textMuted}
            />
          </Pressable>
        )}
        {rightIcon && !secureTextEntry && (
          <Pressable onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={20} color={theme.textMuted} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: theme.error,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}