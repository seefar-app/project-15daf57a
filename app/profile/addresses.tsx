import { useRef, useEffect, useState } from 'react';
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
import { Address } from '@/types';

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, removeAddress, setDefaultAddress } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDelete = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete ${address.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeAddress(address.id),
        },
      ]
    );
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress(addressId);
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
              Saved Addresses
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              {user?.savedAddresses.length || 0} addresses
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
          {user?.savedAddresses.map((address) => (
            <Card key={address.id} variant="elevated">
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
                    name={address.label === 'Home' ? 'home' : address.label === 'Office' ? 'briefcase' : 'location'}
                    size={20}
                    color={theme.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                      {address.label}
                    </Text>
                    {address.isDefault && (
                      <Badge label="Default" variant="success" size="sm" />
                    )}
                  </View>
                  <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}>
                    {address.street}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.textMuted }}>
                    {address.city}, {address.pincode}
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    {!address.isDefault && (
                      <Pressable
                        onPress={() => handleSetDefault(address.id)}
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
                      onPress={() => handleDelete(address)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: theme.errorLight,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.error }}>
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Card>
          ))}

          {user?.savedAddresses.length === 0 && (
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
                <Ionicons name="location-outline" size={40} color={theme.primary} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                No addresses saved
              </Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>
                Add your first delivery address
              </Text>
            </View>
          )}
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
          title="Add New Address"
          onPress={() => {}}
          icon="add-circle-outline"
          fullWidth
        />
      </View>
    </View>
  );
}