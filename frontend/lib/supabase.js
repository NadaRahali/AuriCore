import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseConfig, authConfig } from '../config';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: authConfig.autoRefreshToken,
    persistSession: authConfig.persistSession,
    detectSessionInUrl: false,
  },
});

// Export supabase URL for storage uploads
export const supabaseUrl = supabaseConfig.url;

