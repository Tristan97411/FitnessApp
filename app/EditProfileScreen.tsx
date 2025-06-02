import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

type Profile = {
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

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [weightGoal, setWeightGoal] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupération du profil de l'utilisateur connecté
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Aucun utilisateur connecté.");

        const { data, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (dbError) throw dbError;
        setProfile(data);
        // Pré-remplissage des champs avec les données existantes
        setUsername(data.username || '');
        setWeightGoal(data.weight_goal !== null ? data.weight_goal.toString() : '');
        setCurrentWeight(data.current_weight !== null ? data.current_weight.toString() : '');
        setDailyCalorieGoal(data.daily_calorie_goal !== null ? data.daily_calorie_goal.toString() : '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Aucun utilisateur connecté.");

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username,
          weight_goal: weightGoal ? parseFloat(weightGoal) : null,
          current_weight: currentWeight ? parseFloat(currentWeight) : null,
          daily_calorie_goal: dailyCalorieGoal ? parseFloat(dailyCalorieGoal) : null,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      // Une fois la sauvegarde effectuée, on peut rediriger vers la page profil ou afficher un message de confirmation.
      router.replace('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Modifier le profil</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        
        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Objectif de poids (lbs)"
          value={weightGoal}
          onChangeText={setWeightGoal}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Poids actuel (lbs)"
          value={currentWeight}
          onChangeText={setCurrentWeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Objectif calorique quotidien"
          value={dailyCalorieGoal}
          onChangeText={setDailyCalorieGoal}
          keyboardType="numeric"
        />
        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    marginBottom: 20,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  input: {
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  error: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
  },
});
