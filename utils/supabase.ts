import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrrkjxbhvwpwvnsprzmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpycmtqeGJodndwd3Zuc3Byem1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTcwMTMsImV4cCI6MjA2Njk5MzAxM30.OIKTJjV-i3GDsT0hWdyT_qqz-cNQ0UXp89CzAZY_khU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

//pwdSupabase : groupePFE03-2025 ; nameProjet: trackSecure