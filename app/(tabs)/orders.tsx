import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Order, OrderStatus } from '@/types';
import { format } from 'date-fns';

const statusConfig: Record<OrderStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'error' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  preparing: { label: 'Preparing', variant: 'info' },
  ready: { label: 'Ready', variant: 'success' },
  picked_up: { label: 'Picked Up', variant: 'success' },
  on_the_way: { label: 'On the Way', variant: 'success' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const { orders, cart, activeOrder, setActiveOrder, getCartTotal, getCartCount } = useStore();
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleOrderPress = (order: Order) => {
    setActiveOrder(order);
    router.push(`/order/${order.id}`);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
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
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>
          My Orders
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          Track your orders and reorder favorites
        </Text>
      </LinearGradient>

      {/* Cart Preview */}
      {cartCount > 0 && (
        <Pressable onPress={handleCheckout}>
          <View
            style={{
              margin: 20,
              marginBottom: 0,
              backgroundColor: theme.primary,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="cart" size={22} color="#fff" />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  {cartCount} items in cart
                </Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                  ${cartTotal.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                Checkout
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          </View>
        </Pressable>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 16 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <StatusIndicator status="online" pulse />
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>
                  Active Orders
                </Text>
              </View>

              {activeOrders.map((order) => (
                <Card
                  key={order.id}
                  variant="elevated"
                  onPress={() => handleOrderPress(order)}
                  style={{ marginBottom: 12 }}
                >
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <Image
                      source={{ uri: order.restaurant.image }}
                      style={{ width: 70, height: 70, borderRadius: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
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
                          {order.restaurant.name}
                        </Text>
                        <Badge
                          label={statusConfig[order.status].label}
                          variant={statusConfig[order.status].variant}
                          size="sm"
                        />
                      </View>
                      <Text
                        style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}
                      >
                        {order.items.length} items • ${order.totalPrice.toFixed(2)}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 8,
                        }}
                      >
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={theme.primary}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            color: theme.primary,
                            fontWeight: '500',
                          }}
                        >
                          Est. {format(order.estimatedDelivery, 'h:mm a')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: 16,
                }}
              >
                Past Orders
              </Text>

              {pastOrders.map((order) => (
                <Card
                  key={order.id}
                  variant="outline"
                  onPress={() => handleOrderPress(order)}
                  style={{ marginBottom: 12 }}
                >
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <Image
                      source={{ uri: order.restaurant.image }}
                      style={{ width: 60, height: 60, borderRadius: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontSize: 15, fontWeight: '600', color: theme.text }}
                        numberOfLines={1}
                      >
                        {order.restaurant.name}
                      </Text>
                      <Text
                        style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}
                      >
                        {format(order.createdAt, 'MMM d, yyyy')} •{' '}
                        {order.items.length} items
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: theme.text,
                          }}
                        >
                          ${order.totalPrice.toFixed(2)}
                        </Text>
                        <Pressable
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: theme.secondary,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                          }}
                        >
                          <Ionicons name="refresh" size={14} color={theme.primary} />
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: theme.primary,
                            }}
                          >
                            Reorder
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Empty State */}
          {orders.length === 0 && cartCount === 0 && (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 60,
              }}
            >
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.secondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <Ionicons name="receipt-outline" size={50} color={theme.primary} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: 8,
                }}
              >
                No orders yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  textAlign: 'center',
                  marginBottom: 24,
                }}
              >
                Start exploring restaurants and place your first order!
              </Text>
              <Button
                title="Browse Restaurants"
                onPress={() => router.push('/(tabs)')}
                icon="restaurant-outline"
              />
            </View>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}