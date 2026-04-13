import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Animated, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { format } from 'date-fns';
import { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'error' | 'default'; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: 'Order Placed', variant: 'warning', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', variant: 'info', icon: 'checkmark-circle-outline' },
  preparing: { label: 'Preparing', variant: 'info', icon: 'restaurant-outline' },
  ready: { label: 'Ready for Pickup', variant: 'success', icon: 'bag-check-outline' },
  picked_up: { label: 'Picked Up', variant: 'success', icon: 'bicycle-outline' },
  on_the_way: { label: 'On the Way', variant: 'success', icon: 'navigate-outline' },
  delivered: { label: 'Delivered', variant: 'success', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: 'close-circle-outline' },
};

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { orders } = useStore();

  const order = orders.find(o => o.id === id);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.text }}>Order not found</Text>
      </View>
    );
  }

  const statusInfo = statusConfig[order.status];
  const isActive = !['delivered', 'cancelled'].includes(order.status);

  const handleCallDriver = () => {
    if (order.driver) {
      Linking.openURL(`tel:${order.driver.phone}`);
    }
  };

  const handleCallRestaurant = () => {
    Linking.openURL(`tel:+1234567890`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <LinearGradient
        colors={theme.gradient as unknown as string[]}
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
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
              Order Details
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              Order #{order.id}
            </Text>
          </View>
          <Badge
            label={statusInfo.label}
            variant={statusInfo.variant}
            icon={statusInfo.icon}
          />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, padding: 20, gap: 16 }}>
          {/* Map */}
          {isActive && showMap && order.driver && (
            <Card variant="elevated" style={{ padding: 0, overflow: 'hidden', height: 200 }}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: order.address.coordinates.latitude,
                  longitude: order.address.coordinates.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
              >
                <Marker
                  coordinate={order.address.coordinates}
                  title="Delivery Location"
                >
                  <View style={{ backgroundColor: theme.primary, padding: 8, borderRadius: 20 }}>
                    <Ionicons name="home" size={20} color="#fff" />
                  </View>
                </Marker>
                {order.driver && (
                  <>
                    <Marker
                      coordinate={order.driver.coordinates}
                      title={order.driver.name}
                    >
                      <View style={{ backgroundColor: theme.success, padding: 8, borderRadius: 20 }}>
                        <Ionicons name="bicycle" size={20} color="#fff" />
                      </View>
                    </Marker>
                    <Polyline
                      coordinates={[order.driver.coordinates, order.address.coordinates]}
                      strokeColor={theme.primary}
                      strokeWidth={3}
                      lineDashPattern={[1, 5]}
                    />
                  </>
                )}
              </MapView>
            </Card>
          )}

          {/* Driver Info */}
          {order.driver && isActive && (
            <Card variant="elevated">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Avatar source={order.driver.avatar} name={order.driver.name} size="lg" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                    {order.driver.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                      {order.driver.rating} • {order.driver.vehicleType}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                    {order.driver.vehiclePlate}
                  </Text>
                </View>
                <Pressable
                  onPress={handleCallDriver}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: theme.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                </Pressable>
              </View>
            </Card>
          )}

          {/* Status Timeline */}
          <Card>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 16 }}>
              Order Status
            </Text>
            <View style={{ gap: 16 }}>
              {(['pending', 'confirmed', 'preparing', 'picked_up', 'delivered'] as OrderStatus[]).map((status, index) => {
                const config = statusConfig[status];
                const isCompleted = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivered'].indexOf(order.status) >= index;
                const isCurrent = order.status === status;

                return (
                  <View key={status} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isCompleted ? theme.primary : theme.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {isCurrent ? (
                        <StatusIndicator status="online" pulse />
                      ) : (
                        <Ionicons
                          name={isCompleted ? 'checkmark' : config.icon}
                          size={18}
                          color={isCompleted ? '#fff' : theme.textMuted}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isCurrent ? '600' : '400',
                          color: isCompleted ? theme.text : theme.textMuted,
                        }}
                      >
                        {config.label}
                      </Text>
                      {isCurrent && (
                        <Text style={{ fontSize: 12, color: theme.primary, marginTop: 2 }}>
                          Est. {format(order.estimatedDelivery, 'h:mm a')}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Restaurant Info */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                Restaurant
              </Text>
              <Pressable onPress={handleCallRestaurant}>
                <Ionicons name="call-outline" size={20} color={theme.primary} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <Image
                source={{ uri: order.restaurant.image }}
                style={{ width: 60, height: 60, borderRadius: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>
                  {order.restaurant.name}
                </Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>
                  {order.restaurant.address}
                </Text>
              </View>
            </View>
          </Card>

          {/* Order Items */}
          <Card>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 12 }}>
              Order Items
            </Text>
            <View style={{ gap: 12 }}>
              {order.items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.borderLight,
                  }}
                >
                  <Image
                    source={{ uri: item.menuItem.image }}
                    style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: theme.text, flex: 1 }}>
                        {item.menuItem.name}
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>
                        ${item.totalPrice.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                      Qty: {item.quantity}
                    </Text>
                    {item.specialInstructions && (
                      <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4, fontStyle: 'italic' }}>
                        Note: {item.specialInstructions}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Delivery Address */}
          <Card>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 12 }}>
              Delivery Address
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: theme.secondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="location" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>
                  {order.address.label}
                </Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>
                  {order.address.street}, {order.address.city} {order.address.pincode}
                </Text>
              </View>
            </View>
          </Card>

          {/* Payment Summary */}
          <Card>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 12 }}>
              Payment Summary
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>Subtotal</Text>
                <Text style={{ fontSize: 14, color: theme.text }}>
                  ${(order.totalPrice - order.restaurant.deliveryFee).toFixed(2)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>Delivery Fee</Text>
                <Text style={{ fontSize: 14, color: theme.text }}>
                  ${order.restaurant.deliveryFee.toFixed(2)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.primary }}>
                  ${order.totalPrice.toFixed(2)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Ionicons name="card-outline" size={16} color={theme.textMuted} />
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                  Paid via {order.paymentMethod}
                </Text>
              </View>
            </View>
          </Card>

          {/* Actions */}
          {order.status === 'delivered' && (
            <View style={{ gap: 12 }}>
              <Button
                title="Rate Order"
                onPress={() => {}}
                icon="star-outline"
                fullWidth
              />
              <Button
                title="Reorder"
                onPress={() => {}}
                variant="outline"
                icon="refresh-outline"
                fullWidth
              />
            </View>
          )}

          {isActive && order.status !== 'cancelled' && (
            <Button
              title="Cancel Order"
              onPress={() => {}}
              variant="destructive"
              icon="close-circle-outline"
              fullWidth
            />
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}