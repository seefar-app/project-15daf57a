import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

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
