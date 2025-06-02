import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput, FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';

type WorkoutExercise = {
  id: string;
  name: string;
  series: number;
  repetitions: number;
  rest_time_seconds: number;
  weight: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type WorkoutSet = {
  id: string;
  exercise_id: string;
  series: number;
  repetitions: number;
  rest_time_seconds: number;
  created_at: string;
};

const WorkoutDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [exercise, setExercise] = useState<WorkoutExercise | null>(null);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [series, setSeries] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [restTime, setRestTime] = useState('');

  useEffect(() => {
    if (id) {
      fetchExerciseDetails(id);
      fetchExerciseSets(id);
    }
  }, [id]);

  const fetchExerciseDetails = async (exerciseId: string) => {
    const { data, error } = await supabase
      .from('workout_exercises') // Modification pour la nouvelle table
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les détails de l\'exercice');
    } else {
      setExercise(data);
    }
  };

  const fetchExerciseSets = async (exerciseId: string) => {
    const { data, error } = await supabase
      .from('exercise_sets') // Table des sets des exercices
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: true });

    if (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les séries');
    } else {
      setSets(data || []);
    }
  };

  const handleAddSet = async () => {
    if (!series || !repetitions || !restTime) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const { data, error } = await supabase
      .from('exercise_sets')
      .insert([{
        exercise_id: id,
        series: Number(series),
        repetitions: Number(repetitions),
        rest_time_seconds: Number(restTime),
      }]);

    if (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le set');
    } else {
      Alert.alert('Succès', 'Set ajouté avec succès');
      setSeries('');
      setRepetitions('');
      setRestTime('');
      fetchExerciseSets(id); // Rafraîchit la liste des sets
    }
  };

  return (
    <View style={styles.container}>
      {exercise ? (
        <>
          <Text style={styles.title}>{exercise.name}</Text>
          <Text>Poids: {exercise.weight ? exercise.weight : 'Non défini'}</Text>
          <Text>Notes: {exercise.notes || 'Aucune note'}</Text>

          <Text style={styles.subtitle}>Ajouter un nouveau set :</Text>
          <TextInput
            placeholder="Nombre de séries"
            value={series}
            onChangeText={setSeries}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Nombre de répétitions"
            value={repetitions}
            onChangeText={setRepetitions}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Temps de repos (secondes)"
            value={restTime}
            onChangeText={setRestTime}
            style={styles.input}
            keyboardType="numeric"
          />
          <Button title="Ajouter le set" onPress={handleAddSet} />

          <Text style={styles.subtitle}>Séries :</Text>
          <FlatList
            data={sets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.setItem}>
                <Text>{item.series} séries de {item.repetitions} répétitions</Text>
                <Text>Repos: {item.rest_time_seconds} secondes</Text>
              </View>
            )}
          />
        </>
      ) : (
        <Text>Chargement...</Text>
      )}

      <Button title="Retour" onPress={() => router.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  setItem: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderRadius: 5,
  },
});

export default WorkoutDetailScreen;
