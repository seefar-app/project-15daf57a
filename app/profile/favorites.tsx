import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { restaurants } = useStore();
  const { user, toggleFavoriteRestaurant } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const favoriteRestaurants = restaurants.filter(r => 
    user?.favoriteRestaurants.includes(r.id)
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={theme.gradient as unknown as string[]}
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>
              Favorites
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              {favoriteRestaurants.length} restaurants
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
          {favoriteRestaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              variant="elevated"
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            >
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <Image
                  source={{ uri: restaurant.image }}
                  style={{ width: 80, height: 80, borderRadius: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: '600', color: theme.text }}
                    numberOfLines={1}
                  >
                    {restaurant.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>
                    {restaurant.cuisine.join(', ')}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={{ fontSize: 13, fontWeight: '500', color: theme.text }}>
                        {restaurant.rating}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, color: theme.textMuted }}>•</Text>
                    <Text style={{ fontSize: 13, color: theme.textMuted }}>
                      {restaurant.deliveryTime}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => toggleFavoriteRestaurant(restaurant.id)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: theme.errorLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="heart" size={18} color={theme.error} />
                </Pressable>
              </View>
            </Card>
          ))}

          {favoriteRestaurants.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.secondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="heart-outline" size={40} color={theme.primary} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                No favorites yet
              </Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>
                Start adding restaurants to your favorites
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}