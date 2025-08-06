import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Tables } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';
import { getColors } from '../../lib/theme-colors';

type WorkoutExercise = Tables['workout_exercises']['Row'];

interface ExerciseItemProps {
  exercise: WorkoutExercise;
  onEdit: () => void;
  onDelete: () => void;
}

export const ExerciseItem = ({ exercise, onEdit, onDelete }: ExerciseItemProps) => {
  const { theme } = useTheme();
  const colors = getColors(theme);
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
    <View style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
      <Text style={[styles.name, { color: colors.text }]}>{exercise.name}</Text>
      <Text style={{ color: colors.subtext }}>
        {exercise.series} x {exercise.repetitions} reps • {exercise.rest_time_seconds}s repos
      </Text>
      {exercise.weight && <Text style={{ color: colors.subtext }}>Poids : {exercise.weight} kg</Text>}
      {exercise.notes && <Text style={{ color: colors.subtext }}>Note : {exercise.notes}</Text>}
      <View style={styles.actions}>
        <Button title="✏️" onPress={onEdit} color={colors.accent} />
        <Button title="🗑️" onPress={confirmDelete} color={colors.error} />
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