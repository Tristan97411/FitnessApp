// WorkoutSessionForm.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, Text, useColorScheme } from 'react-native';

interface WorkoutSessionFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (session: { name: string; date: string }) => void;
}

export const WorkoutSessionForm = ({ visible, onClose, onSubmit }: WorkoutSessionFormProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSave = () => {
    if (!name || !date) {
      alert('Remplis tous les champs');
      return;
    }

    onSubmit({ name, date });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1c1c1e' : '#fff' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Nouvelle Séance</Text>

        <TextInput
          placeholder="Nom de la séance"
          style={[styles.input, { color: isDarkMode ? '#fff' : '#333' }]}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Date (format: YYYY-MM-DD)"
          style={[styles.input, { color: isDarkMode ? '#fff' : '#333' }]}
          value={date}
          onChangeText={setDate}
        />

        <Button title="Enregistrer" onPress={handleSave} color="#28a745" />
        <Button title="Annuler" onPress={onClose} color="#6c757d" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
});
