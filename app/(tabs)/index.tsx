import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, isRTL } = useTranslation();

  const { user } = useAuthStore();
  const {
    restaurants,
    featuredRestaurants,
    searchQuery,
    selectedCuisine,
    isLoading,
    fetchRestaurants,
    searchRestaurants,
    filterByCuisine,
    setSelectedRestaurant,
    getCartCount,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cartBadgeAnim = useRef(new Animated.Value(1)).current;

  const cartCount = getCartCount();

  const cuisineFilters = [
    { key: 'All', label: t('cuisine_all') },
    { key: 'Japanese', label: t('cuisine_japanese') },
    { key: 'Italian', label: t('cuisine_italian') },
    { key: 'Mexican', label: t('cuisine_mexican') },
    { key: 'American', label: t('cuisine_american') },
    { key: 'Thai', label: t('cuisine_thai') },
    { key: 'Mediterranean', label: t('cuisine_mediterranean') },
  ];

  useEffect(() => {
    fetchRestaurants();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate cart badge when count changes
  useEffect(() => {
    if (cartCount > 0) {
      Animated.sequence([
        Animated.spring(cartBadgeAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }),
        Animated.spring(cartBadgeAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cartCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setRefreshing(false);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    router.push(`/restaurant/${restaurant.id}`);
  };

  const handleCartPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (cartCount > 0) {
      router.push('/checkout');
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCuisine =
      !selectedCuisine ||
      selectedCuisine === 'All' ||
      r.cuisine.includes(selectedCuisine);

    return matchesSearch && matchesCuisine;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home_good_morning');
    if (hour < 17) return t('home_good_afternoon');
    return t('home_good_evening');
  };

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
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                {getGreeting()}
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>
                {user?.name?.split(' ')[0] || 'Friend'} 👋
              </Text>
            </View>

            {/* Header Action Buttons */}
            <View
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Cart Button */}
              <Pressable
                onPress={handleCartPress}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                accessibilityLabel={`Cart, ${cartCount} items`}
                accessibilityRole="button"
                accessibilityHint="View your cart"
              >
                <Ionicons name="cart-outline" size={24} color="#fff" />
                {cartCount > 0 && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: isRTL ? undefined : -4,
                      left: isRTL ? -4 : undefined,
                      backgroundColor: theme.error,
                      borderRadius: 12,
                      minWidth: 24,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 6,
                      borderWidth: 2,
                      borderColor: '#fff',
                      transform: [{ scale: cartBadgeAnim }],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: '#fff',
                      }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </Animated.View>
                )}
              </Pressable>

              {/* Notification Button */}
              <Pressable
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                accessibilityLabel={t('notifications_title')}
                accessibilityRole="button"
              >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 16,
              marginTop: 20,
              paddingHorizontal: 16,
            }}
          >
            <Ionicons name="search" size={22} color={theme.textMuted} />
            <TextInput
              placeholder={t('home_search_placeholder')}
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={searchRestaurants}
              style={{
                flex: 1,
                paddingVertical: 14,
                marginLeft: isRTL ? 0 : 12,
                marginRight: isRTL ? 12 : 0,
                fontSize: 16,
                color: theme.text,
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable 
                onPress={() => searchRestaurants('')}
                accessibilityLabel={t('common_close')}
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={20} color={theme.textMuted} />
              </Pressable>
            )}
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Cuisine Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: 20, 
            paddingVertical: 16, 
            gap: 10,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          {cuisineFilters.map((cuisine) => (
            <Pressable
              key={cuisine.key}
              onPress={() => filterByCuisine(cuisine.key === 'All' ? null : cuisine.key)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 25,
                backgroundColor:
                  selectedCuisine === cuisine.key || (cuisine.key === 'All' && !selectedCuisine)
                    ? theme.primary
                    : theme.secondary,
              }}
              accessibilityLabel={cuisine.label}
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color:
                    selectedCuisine === cuisine.key || (cuisine.key === 'All' && !selectedCuisine)
                      ? '#fff'
                      : theme.primary,
                }}
              >
                {cuisine.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured Section */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text 
            style={{ 
              fontSize: 22, 
              fontWeight: '700', 
              color: theme.text,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('home_featured')}
          </Text>
          <Text 
            style={{ 
              fontSize: 14, 
              color: theme.textSecondary, 
              marginTop: 4,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('home_featured_subtitle')}
          </Text>
        </View>

        {isLoading ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <SkeletonCard />
          </View>
        ) : (
          <Animated.ScrollView
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16}
            contentContainerStyle={{ 
              paddingHorizontal: 20, 
              paddingVertical: 16, 
              gap: 16,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {featuredRestaurants.map((restaurant, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + 16),
                index * (CARD_WIDTH + 16),
                (index + 1) * (CARD_WIDTH + 16),
              ];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.95, 1, 0.95],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={restaurant.id}
                  style={{ width: CARD_WIDTH, transform: [{ scale }] }}
                >
                  <Pressable 
                    onPress={() => handleRestaurantPress(restaurant)}
                    accessibilityLabel={`${restaurant.name}, ${restaurant.cuisine.join(', ')}`}
                    accessibilityRole="button"
                  >
                    <View
                      style={{
                        borderRadius: 20,
                        overflow: 'hidden',
                        backgroundColor: theme.card,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                        elevation: 8,
                      }}
                    >
                      <Image
                        source={{ uri: restaurant.image }}
                        style={{ width: '100%', height: 180 }}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={{
                          position: 'absolute',
                          bottom: 80,
                          left: 0,
                          right: 0,
                          height: 100,
                        }}
                      />
                      <View style={{ padding: 16 }}>
                        <Text
                          style={{ 
                            fontSize: 18, 
                            fontWeight: '700', 
                            color: theme.text,
                            textAlign: isRTL ? 'right' : 'left',
                          }}
                          numberOfLines={1}
                        >
                          {restaurant.name}
                        </Text>
                        <Text
                          style={{ 
                            fontSize: 13, 
                            color: theme.textSecondary, 
                            marginTop: 4,
                            textAlign: isRTL ? 'right' : 'left',
                          }}
                          numberOfLines={1}
                        >
                          {restaurant.cuisine.join(' • ')}
                        </Text>
                        <View
                          style={{
                            flexDirection: isRTL ? 'row-reverse' : 'row',
                            alignItems: 'center',
                            marginTop: 12,
                            gap: 12,
                          }}
                        >
                          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="star" size={16} color={theme.rating} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>
                              {restaurant.rating}
                            </Text>
                            <Text style={{ fontSize: 12, color: theme.textMuted }}>
                              ({restaurant.reviewCount})
                            </Text>
                          </View>
                          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                            <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                              {restaurant.deliveryTime}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        )}

        {/* All Restaurants */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text 
              style={{ 
                fontSize: 22, 
                fontWeight: '700', 
                color: theme.text,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('home_all_restaurants')}
            </Text>
            <Badge label={`${filteredRestaurants.length} ${t('home_places')}`} variant="primary" />
          </View>
        </View>

        <View style={{ padding: 20, gap: 16 }}>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} padding="none">
                  <SkeletonCard />
                </Card>
              ))
            : filteredRestaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  padding="none"
                  variant="elevated"
                  onPress={() => handleRestaurantPress(restaurant)}
                >
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <Image
                      source={{ uri: restaurant.image }}
                      style={{ width: 110, height: 110, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
                      <View>
                        <Text
                          style={{ 
                            fontSize: 16, 
                            fontWeight: '600', 
                            color: theme.text,
                            textAlign: isRTL ? 'right' : 'left',
                          }}
                          numberOfLines={1}
                        >
                          {restaurant.name}
                        </Text>
                        <Text
                          style={{ 
                            fontSize: 13, 
                            color: theme.textSecondary, 
                            marginTop: 2,
                            textAlign: isRTL ? 'right' : 'left',
                          }}
                          numberOfLines={1}
                        >
                          {restaurant.cuisine.join(' • ')}
                        </Text>
                      </View>
                      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="star" size={14} color={theme.rating} />
                          <Text style={{ fontSize: 13, fontWeight: '500', color: theme.text }}>
                            {restaurant.rating}
                          </Text>
                        </View>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                          <Text style={{ fontSize: 13, color: theme.textMuted }}>
                            {restaurant.deliveryTime}
                          </Text>
                        </View>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="bicycle-outline" size={14} color={theme.textMuted} />
                          <Text style={{ fontSize: 13, color: theme.textMuted }}>
                            ${restaurant.deliveryFee.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}