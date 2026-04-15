import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Order } from '@/types';

type OrderTab = 'active' | 'past';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, isRTL } = useTranslation();
  const { orders } = useStore();

  const [activeTab, setActiveTab] = useState<OrderTab>('active');

  const activeOrders = orders.filter(
    (order) => !['delivered', 'cancelled'].includes(order.status)
  );
  const pastOrders = orders.filter((order) =>
    ['delivered', 'cancelled'].includes(order.status)
  );

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return theme.warning;
      case 'confirmed':
      case 'preparing':
        return theme.info;
      case 'ready':
      case 'picked_up':
      case 'on_the_way':
        return theme.primary;
      case 'delivered':
        return theme.success;
      case 'cancelled':
        return theme.error;
      default:
        return theme.textMuted;
    }
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap: Record<Order['status'], string> = {
      pending: t('orders_status_pending'),
      confirmed: t('orders_status_confirmed'),
      preparing: t('orders_status_preparing'),
      ready: t('orders_status_ready'),
      picked_up: t('orders_status_picked_up'),
      on_the_way: t('orders_status_on_the_way'),
      delivered: t('orders_status_delivered'),
      cancelled: t('orders_status_cancelled'),
    };
    return statusMap[status];
  };

  const handleOrderPress = (order: Order) => {
    router.push(`/order/${order.id}`);
  };

  const renderOrder = (order: Order) => (
    <Card
      key={order.id}
      padding="none"
      variant="elevated"
      onPress={() => handleOrderPress(order)}
    >
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.text,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {order.restaurant.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.textSecondary,
                marginTop: 2,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {new Date(order.createdAt).toLocaleDateString()} •{' '}
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Badge
            label={getStatusText(order.status)}
            variant={
              order.status === 'delivered'
                ? 'success'
                : order.status === 'cancelled'
                ? 'error'
                : 'warning'
            }
          />
        </View>

        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Image
            source={{ uri: order.restaurant.image }}
            style={{ width: 60, height: 60, borderRadius: 8 }}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                color: theme.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              }}
              numberOfLines={2}
            >
              {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.text,
                marginTop: 4,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              ${order.total.toFixed(2)}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            gap: 8,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          {activeTab === 'active' ? (
            <Pressable
              style={{
                flex: 1,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: theme.primary,
              }}
              onPress={() => handleOrderPress(order)}
              accessibilityLabel={t('orders_track')}
              accessibilityRole="button"
            >
              <Ionicons name="location-outline" size={18} color="#fff" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                {t('orders_track')}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={{
                flex: 1,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: theme.secondary,
              }}
              accessibilityLabel={t('orders_reorder')}
              accessibilityRole="button"
            >
              <Ionicons name="repeat-outline" size={18} color={theme.primary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.primary }}>
                {t('orders_reorder')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Card>
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
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#fff',
            marginBottom: 20,
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {t('orders_title')}
        </Text>

        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 12,
            padding: 4,
          }}
        >
          <Pressable
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: activeTab === 'active' ? '#fff' : 'transparent',
            }}
            onPress={() => setActiveTab('active')}
            accessibilityLabel={t('orders_active')}
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'active' ? theme.primary : '#fff',
                textAlign: 'center',
              }}
            >
              {t('orders_active')} ({activeOrders.length})
            </Text>
          </Pressable>
          <Pressable
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: activeTab === 'past' ? '#fff' : 'transparent',
            }}
            onPress={() => setActiveTab('past')}
            accessibilityLabel={t('orders_past')}
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'past' ? theme.primary : '#fff',
                textAlign: 'center',
              }}
            >
              {t('orders_past')} ({pastOrders.length})
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'active' ? (
          activeOrders.length > 0 ? (
            <View style={{ gap: 16 }}>
              {activeOrders.map(renderOrder)}
            </View>
          ) : (
            <EmptyState
              icon="receipt-outline"
              title={t('orders_no_active')}
              description={t('home_search_placeholder')}
              actionLabel={t('home_featured')}
              onAction={() => router.push('/(tabs)')}
            />
          )
        ) : pastOrders.length > 0 ? (
          <View style={{ gap: 16 }}>
            {pastOrders.map(renderOrder)}
          </View>
        ) : (
          <EmptyState
            icon="time-outline"
            title={t('orders_no_past')}
            description={t('home_search_placeholder')}
            actionLabel={t('home_featured')}
            onAction={() => router.push('/(tabs)')}
          />
        )}
      </ScrollView>
    </View>
  );
}