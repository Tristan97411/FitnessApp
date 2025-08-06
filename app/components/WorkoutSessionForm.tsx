// WorkoutSessionForm.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { PlusCircle, X } from 'lucide-react-native';
import { useTheme } from '../../lib/ThemeContext';
import { getColors } from '../../lib/theme-colors';

interface WorkoutSessionFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (session: { name: string; date: string }) => void;
}

export const WorkoutSessionForm = ({ visible, onClose, onSubmit }: WorkoutSessionFormProps) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const { theme } = useTheme();
  const colors = getColors(theme);

  const handleSave = () => {
    if (!name || !date) {
      alert('Remplis tous les champs');
      return;
    }

    onSubmit({ name, date });
    setName('');
    setDate('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Nouvelle Séance</Text>
              <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.input }]}>
                <X size={20} color={colors.accent} />
              </Pressable>
            </View>

            <TextInput
              placeholder="Nom de la séance"
              placeholderTextColor={colors.subtext}
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
            />

            <TextInput
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={colors.subtext}
              value={date}
              onChangeText={setDate}
              style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
            />

            <Pressable onPress={handleSave} style={[styles.submitButton, { backgroundColor: colors.button }]}>
              <PlusCircle size={18} color={colors.buttonText} style={{ marginRight: 6 }} />
              <Text style={[styles.submitButtonText, { color: colors.buttonText }]}>Créer</Text>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Inter_400Regular',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
