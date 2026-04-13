import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const {
    cart,
    selectedRestaurant,
    appliedPromo,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
    applyPromoCode,
    removePromoCode,
    createOrder,
  } = useStore();
  const { user } = useAuthStore();

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'wallet' | 'cash'>('card');
  const [selectedAddress, setSelectedAddress] = useState(user?.savedAddresses?.[0]?.id || '');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const subtotal = getCartTotal();
  const deliveryFee = selectedRestaurant?.deliveryFee || 2.99;
  const serviceFee = 1.49;
  const discount = appliedPromo
    ? appliedPromo.discountType === 'percentage'
      ? subtotal * (appliedPromo.discount / 100)
      : appliedPromo.discount
    : 0;
  const total = subtotal + deliveryFee + serviceFee - discount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    const success = await applyPromoCode(promoCode);
    setPromoLoading(false);
    if (!success) {
      Alert.alert('Invalid Code', 'This promo code is invalid or has expired.');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPromoCode('');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Select Address', 'Please select a delivery address.');
      return;
    }

    setIsPlacingOrder(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const order = await createOrder(selectedAddress, selectedPayment);
      setOrderSuccess(true);

      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        router.replace(`/order/${order.id}`);
      }, 2000);
    } catch (error) {
      Alert.alert('Order Failed', 'Something went wrong. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: successScale }],
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: theme.successLight,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Ionicons name="checkmark" size={50} color={theme.success} />
          </View>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '700',
              color: theme.text,
              textAlign: 'center',
            }}
          >
            Order Placed!
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: theme.textSecondary,
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            Your delicious food is being prepared. {'\n'}
            You'll receive updates soon!
          </Text>
        </Animated.View>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.text} />
          </Pressable>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: theme.text,
              marginLeft: 16,
            }}
          >
            Your Cart
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
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
            <Ionicons name="cart-outline" size={50} color={theme.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '600', color: theme.text }}>
            Your cart is empty
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.textSecondary,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Add items from a restaurant to get started
          </Text>
          <Button
            title="Browse Restaurants"
            onPress={() => router.push('/(tabs)')}
            style={{ marginTop: 24 }}
            icon="restaurant-outline"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: theme.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.text} />
          </Pressable>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: theme.text,
              marginLeft: 16,
            }}
          >
            Checkout
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Restaurant Info */}
          {selectedRestaurant && (
            <Card style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Image
                  source={{ uri: selectedRestaurant.image }}
                  style={{ width: 50, height: 50, borderRadius: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                    {selectedRestaurant.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                    {selectedRestaurant.deliveryTime} delivery
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Cart Items */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Your Order
          </Text>

          {cart.map((item) => (
            <Card key={item.id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={{ uri: item.menuItem.image }}
                  style={{ width: 60, height: 60, borderRadius: 8 }}
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: '500', color: theme.text }}
                    numberOfLines={1}
                  >
                    {item.menuItem.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.primary, marginTop: 4 }}>
                    ${item.menuItem.price.toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    onPress={() =>
                      updateCartItemQuantity(item.id, item.quantity - 1)
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: theme.backgroundSecondary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="remove" size={18} color={theme.text} />
                  </Pressable>
                  <Text
                    style={{ fontSize: 16, fontWeight: '600', color: theme.text }}
                  >
                    {item.quantity}
                  </Text>
                  <Pressable
                    onPress={() =>
                      updateCartItemQuantity(item.id, item.quantity + 1)
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: theme.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}

          {/* Delivery Address */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.text,
              marginTop: 20,
              marginBottom: 12,
            }}
          >
            Delivery Address
          </Text>

          {user?.savedAddresses?.map((address) => (
            <Pressable
              key={address.id}
              onPress={() => setSelectedAddress(address.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor:
                  selectedAddress === address.id ? theme.secondary : theme.card,
                borderRadius: 12,
                borderWidth: 2,
                borderColor:
                  selectedAddress === address.id ? theme.primary : theme.border,
                marginBottom: 10,
              }}
            >
              <Ionicons
                name={
                  address.label === 'Home'
                    ? 'home-outline'
                    : address.label === 'Office'
                    ? 'business-outline'
                    : 'location-outline'
                }
                size={22}
                color={selectedAddress === address.id ? theme.primary : theme.textMuted}
                style={{ marginRight: 14 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '500', color: theme.text }}>
                  {address.label}
                </Text>
                <Text
                  style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}
                >
                  {address.street}, {address.city}
                </Text>
              </View>
              {selectedAddress === address.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
              )}
            </Pressable>
          ))}

          {/* Payment Method */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.text,
              marginTop: 20,
              marginBottom: 12,
            }}
          >
            Payment Method
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['card', 'wallet', 'cash'] as const).map((method) => (
              <Pressable
                key={method}
                onPress={() => setSelectedPayment(method)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor:
                    selectedPayment === method ? theme.secondary : theme.card,
                  borderWidth: 2,
                  borderColor:
                    selectedPayment === method ? theme.primary : theme.border,
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name={
                    method === 'card'
                      ? 'card-outline'
                      : method === 'wallet'
                      ? 'wallet-outline'
                      : 'cash-outline'
                  }
                  size={24}
                  color={selectedPayment === method ? theme.primary : theme.textMuted}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: selectedPayment === method ? theme.primary : theme.text,
                    marginTop: 6,
                    textTransform: 'capitalize',
                  }}
                >
                  {method}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Promo Code */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.text,
              marginTop: 20,
              marginBottom: 12,
            }}
          >
            Promo Code
          </Text>

          {appliedPromo ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                backgroundColor: theme.successLight,
                borderRadius: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="pricetag" size={20} color={theme.success} />
                <Text style={{ fontSize: 15, fontWeight: '500', color: theme.success }}>
                  {appliedPromo.code} applied
                </Text>
              </View>
              <Pressable onPress={removePromoCode}>
                <Ionicons name="close-circle" size={22} color={theme.success} />
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Enter code"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
              </View>
              <Button
                title="Apply"
                onPress={handleApplyPromo}
                loading={promoLoading}
                disabled={!promoCode.trim()}
                variant="outline"
              />
            </View>
          )}

          {/* Order Summary */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.text,
              marginTop: 20,
              marginBottom: 12,
            }}
          >
            Order Summary
          </Text>

          <Card>
            <View style={{ gap: 12 }}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  Subtotal
                </Text>
                <Text style={{ fontSize: 14, color: theme.text }}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  Delivery Fee
                </Text>
                <Text style={{ fontSize: 14, color: theme.text }}>
                  ${deliveryFee.toFixed(2)}
                </Text>
              </View>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  Service Fee
                </Text>
                <Text style={{ fontSize: 14, color: theme.text }}>
                  ${serviceFee.toFixed(2)}
                </Text>
              </View>
              {discount > 0 && (
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                >
                  <Text style={{ fontSize: 14, color: theme.success }}>
                    Discount
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.success }}>
                    -${discount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.border,
                  marginVertical: 4,
                }}
              />
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                  Total
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: '700', color: theme.primary }}
                >
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Place Order Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          paddingBottom: insets.bottom + 20,
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        <Button
          title={`Place Order • $${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          loading={isPlacingOrder}
          fullWidth
          size="lg"
          icon="checkmark-circle"
        />
      </View>
    </View>
  );
}