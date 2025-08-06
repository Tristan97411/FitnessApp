import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

type Props = {
  index: number;
  rep: string;
  weight: string;
  onRepChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  colors: any;
};

export default function SerieInputRow({ index, rep, weight, onRepChange, onWeightChange, colors }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.text }]}>Série {index + 1}</Text>
      <View style={styles.inputs}>
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Rép</Text>
          <TextInput
            value={rep}
            onChangeText={onRepChange}
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
            placeholder="ex: 10"
            placeholderTextColor={colors.placeholder}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Poids</Text>
          <TextInput
            value={weight}
            onChangeText={onWeightChange}
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
            placeholder="ex: 60"
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 15,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 5,
  },
  inputs: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});
