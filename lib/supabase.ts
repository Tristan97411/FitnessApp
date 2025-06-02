import 'react-native-url-polyfill/auto';
  import { createClient } from '@supabase/supabase-js';
  import Constants from 'expo-constants';

  const extra =
    Constants.expoConfig?.extra ??
    Constants.manifest?.extra ??
    (Constants as any).manifest2?.extra;

  const supabaseUrl = extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;


  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration. Please connect to Supabase using the "Connect to Supabase" button.'
    );
  }

  // Affichage de debug pour vérifier que la configuration est chargée
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key:', supabaseAnonKey);
  console.log('Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
});


  export type Tables = {
    users: {
      Row: {
        id: string;
        email: string | null;
        username: string | null;
        weight_goal: number | null;
        current_weight: number | null;
        height: number | null;
        daily_calorie_goal: number | null;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id: string;
        email?: string | null;
        username?: string | null;
        weight_goal?: number | null;
        current_weight?: number | null;
        height?: number | null;
        daily_calorie_goal?: number | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        email?: string | null;
        username?: string | null;
        weight_goal?: number | null;
        current_weight?: number | null;
        height?: number | null;
        daily_calorie_goal?: number | null;
        updated_at?: string;
      };
    };
    meals: {
      Row: {
        id: string;
        user_id: string;
        name: string;
        calories: number;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
        meal_type: string;
        date: string;
        created_at: string;
      };
      Insert: {
        user_id: string;
        name: string;
        calories: number;
        protein?: number | null;
        carbs?: number | null;
        fat?: number | null;
        meal_type: string;
        date?: string;
        created_at?: string;
      };
      Update: {
        name?: string;
        calories?: number;
        protein?: number | null;
        carbs?: number | null;
        fat?: number | null;
        meal_type?: string;
        date?: string;
      };
    };
    workouts: {
      Row: {
        id: string;
        user_id: string;
        name: string;
        created_at: string;
      };
      Insert: {
        user_id: string;
        name: string;
        created_at?: string;
      };
      Update: {
        name?: string;
      };
    };
    workout_exercises: {
      Row: {
        id: string;
        workout_id: string;
        name: string;
        series: number;
        repetitions: number;
        rest_time_seconds: number;
        weight: number | null;
        notes: string | null;
        created_at: string;
      };
      Insert: {
        workout_id: string;
        name: string;
        series: number;
        repetitions: number;
        rest_time_seconds: number;
        weight?: number | null;
        notes?: string | null;
        created_at?: string;
      };
      Update: {
        name?: string;
        series?: number;
        repetitions?: number;
        rest_time_seconds?: number;
        weight?: number | null;
        notes?: string | null;
      };
    };
    
    weight_logs: {
      Row: {
        id: string;
        user_id: string;
        weight: number;
        date: string;
        created_at: string;
      };
      Insert: {
        user_id: string;
        weight: number;
        date?: string;
        created_at?: string;
      };
      Update: {
        weight?: number;
        date?: string;
      };
    };
  }; 