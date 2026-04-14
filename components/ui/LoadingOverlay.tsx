import { View, ActivityIndicator, Text, Modal } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: theme.overlay,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            gap: 16,
            minWidth: 200,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          {message && (
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: theme.text,
                textAlign: 'center',
              }}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}