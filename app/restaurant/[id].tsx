import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { MenuItem } from '@/types';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const { selectedRestaurant, getRestaurantById, addToCart, cart, getCartCount, getCartTotal } = useStore();
  const { user, toggleFavoriteRestaurant } = useAuthStore();

  const restaurant = selectedRestaurant || getRestaurantById(id as string);
  const isFavorite = user?.favoriteRestaurants?.includes(restaurant?.id || '');

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!restaurant) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  const categories = [...new Set(restaurant.menu.map((item) => item.category))];
  const filteredMenu = selectedCategory
    ? restaurant.menu.filter((item) => item.category === selectedCategory)
    : restaurant.menu;

  const handleAddToCart = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart(item, 1);
  };

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavoriteRestaurant(restaurant.id);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Animated Header */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          opacity: headerOpacity,
        }}
      >
        <LinearGradient
          colors={[theme.background, theme.background]}
          style={{
            paddingTop: insets.top,
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.backgroundSecondary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.text,
              flex: 1,
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {restaurant.name}
          </Text>
          <Pressable
            onPress={handleToggleFavorite}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.backgroundSecondary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? theme.error : theme.text}
            />
          </Pressable>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 100 : 40 }}
      >
        {/* Hero Image */}
        <Animated.View
          style={{
            height: HEADER_HEIGHT,
            transform: [{ scale: imageScale }],
          }}
        >
          <Image
            source={{ uri: restaurant.image }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
            }}
          />

          {/* Back & Favorite Buttons */}
          <View
            style={{
              position: 'absolute',
              top: insets.top + 12,
              left: 16,
              right: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.9)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={handleToggleFavorite}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.9)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? theme.error : theme.text}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Restaurant Info */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: -40 }}>
          <View
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 24,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: '700', color: theme.text }}>
              {restaurant.name}
            </Text>
            <Text
              style={{ fontSize: 15, color: theme.textSecondary, marginTop: 6 }}
            >
              {restaurant.cuisine.join(' • ')}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                marginTop: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.warningLight,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    gap: 4,
                  }}
                >
                  <Ionicons name="star" size={14} color={theme.rating} />
                  <Text
                    style={{ fontSize: 14, fontWeight: '600', color: theme.text }}
                  >
                    {restaurant.rating}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: theme.textMuted }}>
                  ({restaurant.reviewCount} reviews)
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  {restaurant.deliveryTime}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="bicycle-outline" size={16} color={theme.textSecondary} />
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  ${restaurant.deliveryFee.toFixed(2)} delivery
                </Text>
              </View>
            </View>

            {/* Info Cards */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.secondary,
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <Ionicons name="location-outline" size={20} color={theme.primary} />
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.text,
                    marginTop: 8,
                    fontWeight: '500',
                  }}
                  numberOfLines={2}
                >
                  {restaurant.address}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.secondary,
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <Ionicons name="time-outline" size={20} color={theme.primary} />
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.text,
                    marginTop: 8,
                    fontWeight: '500',
                  }}
                  numberOfLines={2}
                >
                  {restaurant.hours}
                </Text>
              </View>
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 20,
              gap: 10,
            }}
          >
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 25,
                backgroundColor: !selectedCategory ? theme.primary : theme.backgroundSecondary,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: !selectedCategory ? '#fff' : theme.text,
                }}
              >
                All
              </Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 25,
                  backgroundColor:
                    selectedCategory === category
                      ? theme.primary
                      : theme.backgroundSecondary,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: selectedCategory === category ? '#fff' : theme.text,
                  }}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Menu Items */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
              Menu
            </Text>

            {filteredMenu.map((item) => (
              <Card
                key={item.id}
                variant="default"
                padding="none"
                style={{ marginBottom: 14 }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 110, height: 110, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      flex: 1,
                      padding: 14,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: theme.text,
                            flex: 1,
                          }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.vegetarian && (
                          <Badge label="Veg" variant="success" size="sm" />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: theme.textSecondary,
                          marginTop: 4,
                        }}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: '700',
                          color: theme.primary,
                        }}
                      >
                        ${item.price.toFixed(2)}
                      </Text>
                      <Pressable
                        onPress={() => handleAddToCart(item)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: theme.primary,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons name="add" size={22} color="#fff" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Cart Footer */}
      {cartCount > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            paddingBottom: insets.bottom + 16,
            backgroundColor: theme.card,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Pressable
            onPress={() => router.push('/checkout')}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                  {cartCount}
                </Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                View Cart
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
              ${cartTotal.toFixed(2)}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}