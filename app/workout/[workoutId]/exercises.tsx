import { View, Text, FlatList, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function WorkoutExerciseListScreen() {
  const { workoutId } = useLocalSearchParams();
  const [exercises, setExercises] = useState<any[]>([]);
  const router = useRouter();

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', workoutId);

    if (error) console.error(error);
    else setExercises(data);
  };

  useEffect(() => {
    if (workoutId) fetchExercises();
  }, [workoutId]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Exercices de la séance</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10 }}>
            <Text>Nom: {item.name}</Text>
            <Text>Séries: {item.series}</Text>
            <Text>Répétitions: {item.repetitions}</Text>
            <Text>Temps de repos : {item.rest_time_seconds}</Text>
            <Text>Poids : {item.weight}</Text>
            <Button
        title="Voir la progression"
        onPress={() => router.push(`/progress/${item.name}` as any)}
      />
          </View>
        )}
      />

      <Button
        title="Ajouter un exercice"
        onPress={() => router.push(`/workout/${workoutId}/add-exercise` as any)}
      />
      <Button 
      title='Retour'
      onPress={() => router.back()}/>
    </View>
  );
}
