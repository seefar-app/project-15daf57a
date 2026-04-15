import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, updateUser, updateAvatar } = useAuthStore();
  const { toast, showToast, hideToast, success, error: showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to change your profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Update local preview immediately
        setAvatar(imageUri);
        setIsUploadingImage(true);

        // Upload to Supabase
        const uploadResult = await updateAvatar(imageUri);

        setIsUploadingImage(false);

        if (uploadResult.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          success('Profile picture updated successfully');
        } else {
          // Revert to previous avatar on error
          setAvatar(user?.avatar || '');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          showError(uploadResult.error || 'Failed to upload image. Please try again.');
        }
      }
    } catch (err) {
      setIsUploadingImage(false);
      setAvatar(user?.avatar || '');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError('An error occurred while uploading the image.');
      console.error('Image picker error:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showError('Please fill in all fields');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showError('Please enter a valid email address');
        return;
      }

      // Basic phone validation (at least 10 digits)
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showError('Please enter a valid phone number');
        return;
      }

      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await updateUser({ name, email, phone });
      
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      success('Profile updated successfully');
      
      // Navigate back after short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
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
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', flex: 1 }}>
            Edit Profile
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, gap: 24 }}>
            {/* Avatar */}
            <View style={{ alignItems: 'center' }}>
              <Pressable 
                onPress={handlePickImage}
                disabled={isUploadingImage}
                accessibilityLabel="Change profile picture"
                accessibilityRole="button"
                accessibilityHint="Tap to select a new profile picture from your photo library"
              >
                <View style={{ position: 'relative' }}>
                  <Avatar 
                    source={avatar} 
                    name={name} 
                    size="xl"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isUploadingImage ? theme.textMuted : theme.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 3,
                      borderColor: theme.background,
                    }}
                  >
                    {isUploadingImage ? (
                      <Ionicons name="hourglass" size={18} color="#fff" />
                    ) : (
                      <Ionicons name="camera" size={18} color="#fff" />
                    )}
                  </View>
                </View>
              </Pressable>
              <Text 
                style={{ 
                  fontSize: 13, 
                  color: theme.textMuted, 
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                {isUploadingImage ? 'Uploading...' : 'Tap to change photo'}
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 16 }}>
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                icon="person-outline"
                editable={!isLoading}
                accessibilityLabel="Full name input"
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                editable={!isLoading}
                accessibilityLabel="Email input"
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                icon="call-outline"
                editable={!isLoading}
                accessibilityLabel="Phone number input"
              />
            </View>

            {/* Actions */}
            <View style={{ gap: 12, marginTop: 8 }}>
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={isLoading}
                disabled={isUploadingImage}
                fullWidth
                size="lg"
              />
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="outline"
                fullWidth
                disabled={isLoading || isUploadingImage}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={hideToast}
        />
      )}
    </View>
  );
}