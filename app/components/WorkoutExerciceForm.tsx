// WorkoutExerciseForm.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Modal, StyleSheet, Text, useColorScheme } from 'react-native';

interface WorkoutExerciseFormProps {
  workoutId: string; // ID de la séance associée
  visible: boolean; // Contrôle de la visibilité du formulaire
  onClose: () => void; // Fonction pour fermer le formulaire
  onSubmit: (exercise: { name: string; series: number; repetitions: number; workout_id: string }) => void; // Fonction pour soumettre un exercice
}

export const WorkoutExerciseForm = ({ workoutId, visible, onClose, onSubmit }: WorkoutExerciseFormProps) => {
  const isDarkMode = useColorScheme() === 'dark'; // Détection du mode sombre

  // États pour gérer les champs de l'exercice
  const [name, setName] = useState('');
  const [series, setSeries] = useState('');
  const [repetitions, setRepetitions] = useState('');

  const handleSave = () => {
    // Validation de la saisie
    if (!name || !series || !repetitions) {
      alert('Remplis tous les champs');
      return;
    }

    // Soumission des données
    onSubmit({
      name,
      series: parseInt(series), // Convertir la série en nombre
      repetitions: parseInt(repetitions), // Convertir les répétitions en nombre
      workout_id: workoutId, // Ajouter l'ID de la séance
    });
    onClose(); // Fermer le formulaire après soumission
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1c1c1e' : '#fff' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Ajouter un Exercice</Text>

        <TextInput
          placeholder="Nom de l'exercice"
          style={[styles.input, { color: isDarkMode ? '#fff' : '#333' }]}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Séries"
          style={[styles.input, { color: isDarkMode ? '#fff' : '#333' }]}
          value={series}
          onChangeText={setSeries}
          keyboardType="numeric" // Spécifie que c'est un champ numérique
        />
        <TextInput
          placeholder="Répétitions"
          style={[styles.input, { color: isDarkMode ? '#fff' : '#333' }]}
          value={repetitions}
          onChangeText={setRepetitions}
          keyboardType="numeric" // Spécifie que c'est un champ numérique
        />
        
        {/* Bouton pour enregistrer l'exercice */}
        <Button title="Enregistrer" onPress={handleSave} color="#28a745" />
        <Button title="Annuler" onPress={onClose} color="#6c757d" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center', // Centrer les éléments dans le modal
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%', // Rendre les champs de saisie aussi larges que possible
    fontSize: 16,
  },
});
