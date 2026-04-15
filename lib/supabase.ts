import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const supabaseUrl = 'https://xuuexrxhkipibdhmzjts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dWV4cnhoa2lwaWJkaG16anRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDYyNzAsImV4cCI6MjA5MTgyMjI3MH0.yjmKDL-jLcR1FRp8OuQVISrplmySviZrguW9A5tFnnM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Upload an image to Supabase Storage
 * @param uri - Local file URI from ImagePicker
 * @param bucket - Storage bucket name (e.g., 'user_avatars')
 * @param path - File path within bucket (e.g., 'user-123/avatar.jpg')
 * @returns Public URL of uploaded image or null on error
 */
export async function uploadImage(
  uri: string,
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determine content type from URI
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType,
        upsert: true, // Replace existing file
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within bucket
 * @returns true if successful, false otherwise
 */
export async function deleteImage(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image deletion failed:', error);
    return false;
  }
}

/**
 * Generate a unique file path for user avatar
 * @param userId - User ID
 * @param extension - File extension (jpg, png, etc.)
 * @returns Unique file path
 */
export function generateAvatarPath(userId: string, extension: string = 'jpg'): string {
  const timestamp = Date.now();
  return `${userId}/avatar-${timestamp}.${extension}`;
}