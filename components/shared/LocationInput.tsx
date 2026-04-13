import { View, Text, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';

interface LocationSuggestion {
  id: string;
  address: string;
  city: string;
}

interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectLocation: (location: LocationSuggestion) => void;
  label?: string;
  placeholder?: string;
}

const mockSuggestions: LocationSuggestion[] = [
  { id: '1', address: '123 Ocean Drive', city: 'Miami Beach' },
  { id: '2', address: '456 Collins Avenue', city: 'Miami Beach' },
  { id: '3', address: '789 Lincoln Road', city: 'Miami' },
  { id: '4', address: '321 Washington Ave', city: 'South Beach' },
];

export function LocationInput({
  value,
  onChangeText,
  onSelectLocation,
  label,
  placeholder = 'Enter address',
}: LocationInputProps) {
  const theme = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = value.length > 2
    ? mockSuggestions.filter(s =>
        s.address.toLowerCase().includes(value.toLowerCase()) ||
        s.city.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  return (
    <View>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(text.length > 2);
        }}
        icon="location-outline"
        onFocus={() => value.length > 2 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View
          style={{
            marginTop: 8,
            borderRadius: 12,
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <Pressable
              key={suggestion.id}
              onPress={() => {
                onSelectLocation(suggestion);
                onChangeText(suggestion.address);
                setShowSuggestions(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderBottomWidth: index < filteredSuggestions.length - 1 ? 1 : 0,
                borderBottomColor: theme.border,
              }}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.primary}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: theme.text, fontWeight: '500' }}>
                  {suggestion.address}
                </Text>
                <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                  {suggestion.city}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}