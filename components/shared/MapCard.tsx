import { View, Text, Pressable, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface MapCardProps {
  latitude: number;
  longitude: number;
  title?: string;
  onPress?: () => void;
  height?: number;
  showFullScreenButton?: boolean;
}

export function MapCard({
  latitude,
  longitude,
  title,
  onPress,
  height = 150,
  showFullScreenButton = false,
}: MapCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        height,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: theme.backgroundSecondary,
      }}
    >
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
      {showFullScreenButton && (
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons name="expand-outline" size={20} color={theme.text} />
        </View>
      )}
      {title && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}