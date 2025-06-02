import React from 'react';
import { View, Text, Button, StyleSheet, Alert, useColorScheme } from 'react-native';
import { Tables } from '../../lib/supabase';

type WorkoutExercise = Tables['workout_exercises']['Row'];

interface ExerciseItemProps {
  exercise: WorkoutExercise;
  onEdit: () => void;
  onDelete: () => void;
}

export const ExerciseItem = ({ exercise, onEdit, onDelete }: ExerciseItemProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer',
      `Êtes-vous sûr de vouloir supprimer ${exercise.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive', onPress: async () => {
            await onDelete();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f7' }]}>
      <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#333' }]}>{exercise.name}</Text>
      <Text style={{ color: isDarkMode ? '#ddd' : '#555' }}>
        {exercise.series} x {exercise.repetitions} reps • {exercise.rest_time_seconds}s repos
      </Text>
      {exercise.weight && <Text style={{ color: isDarkMode ? '#ddd' : '#555' }}>Poids : {exercise.weight} kg</Text>}
      {exercise.notes && <Text style={{ color: isDarkMode ? '#ddd' : '#555' }}>Note : {exercise.notes}</Text>}
      <View style={styles.actions}>
        <Button title="✏️" onPress={onEdit} color="#007bff" />
        <Button title="🗑️" onPress={confirmDelete} color="#dc3545" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 15,
    justifyContent: 'flex-end',
  },
});