import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Picker } from '@react-native-picker/picker';

const AddExerciseScreen = () => {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();

  const [exerciseName, setExerciseName] = useState('');
  const [series, setSeries] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [rest_time_seconds, setrest_time_seconds] = useState('');
  const [weight, setWeight] = useState('');

 // Liste fixe d'exercices disponibles
 const exerciseOptions = [
  'Développé couché',
  'Développé couché incliné',
  'Squat',
  'Soulevé de terre',
  'Tractions',
  'Développé militaire',
  'Preacher Curl',
  'Dips',
  'Fente avant',
  'Rowing barre',
  'Crunch',
];

  if (!workoutId) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>
          Erreur : aucune séance sélectionnée.
        </Text>
      </View>
    );
  }

  const handleAddExercise = async () => {
    const newExercise = {
      name: exerciseName,
      series: parseInt(series),
      repetitions: parseInt(repetitions),
      rest_time_seconds: parseInt(rest_time_seconds),
      weight: parseInt(weight),
    };

    const { data, error } = await supabase.from('workout_exercises').insert([{
      workout_id: workoutId,
      ...newExercise,
    }]);

    if (error) {
      console.error('Erreur lors de l\'ajout de l\'exercice:', error);
      return;
    }

    console.log('Exercice ajouté avec succès:', data);
    router.back(); // revenir à l'écran précédent
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un exercice</Text>

      <Text style={{ marginBottom: 5 }}>Nom de l'exercice</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={exerciseName}
          style={{padding:15}}
          onValueChange={(itemValue) => setExerciseName(itemValue)}
        >
          <Picker.Item label="-- Choisir un exercice --" value="" />
          {exerciseOptions.map((ex) => (
            <Picker.Item key={ex} label={ex} value={ex} />
          ))}
        </Picker>
      </View>
      <TextInput
        placeholder="Séries"
        value={series}
        onChangeText={setSeries}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Répétitions"
        value={repetitions}
        onChangeText={setRepetitions}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Temps de repos (en secondes)"
        value={rest_time_seconds}
        onChangeText={setrest_time_seconds}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Poids"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Ajouter l'Exercice" onPress={handleAddExercise} />
            <Button title="Retour" onPress={() => router.back()} />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { marginBottom: 10, borderWidth: 1, padding: 8 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
});

export default AddExerciseScreen;
