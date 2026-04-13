import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cash';
  cardBrand?: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    cardBrand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '25',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    cardBrand: 'Mastercard',
    last4: '8888',
    expiryMonth: '08',
    expiryYear: '26',
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDelete = (method: PaymentMethod) => {
    Alert.alert(
      'Remove Payment Method',
      `Remove ${method.cardBrand} ending in ${method.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {},
        },
      ]
    );
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      default:
        return 'card-outline';
    }
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
              Payment Methods
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              Manage your payment options
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
          {/* Wallet */}
          <Card variant="elevated">
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: theme.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="wallet" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                  FoodDash Wallet
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: theme.primary, marginTop: 4 }}>
                  ${user?.wallet.toFixed(2)}
                </Text>
                <Pressable
                  style={{
                    marginTop: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: theme.secondary,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>
                    Add Money
                  </Text>
                </Pressable>
              </View>
            </View>
          </Card>

          {/* Cards */}
          {mockPaymentMethods.map((method) => (
            <Card key={method.id} variant="elevated">
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: theme.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={getCardIcon(method.cardBrand || '')}
                    size={20}
                    color={theme.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                      {method.cardBrand}
                    </Text>
                    {method.isDefault && (
                      <Badge label="Default" variant="success" size="sm" />
                    )}
                  </View>
                  <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                    •••• {method.last4}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    {!method.isDefault && (
                      <Pressable
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: theme.secondary,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>
                          Set Default
                        </Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => handleDelete(method)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: theme.errorLight,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.error }}>
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Card>
          ))}

          {/* Cash on Delivery */}
          <Card variant="outline">
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: theme.secondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="cash-outline" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                  Cash on Delivery
                </Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>
                  Pay with cash when your order arrives
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          paddingBottom: insets.bottom + 20,
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        <Button
          title="Add New Card"
          onPress={() => {}}
          icon="add-circle-outline"
          fullWidth
        />
      </View>
    </View>
  );
}