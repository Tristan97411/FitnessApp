import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, SafeAreaView, ScrollView, Pressable,   TouchableOpacity,
  Modal, FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Picker } from '@react-native-picker/picker';
import { ChevronLeft, Dumbbell, PlusCircle } from 'lucide-react-native';
import { useTheme } from '../../../lib/ThemeContext';
import { getColors } from '../../../lib/theme-colors';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';


const AddExerciseScreen = () => {
  const router = useRouter();
  const {
    workoutId,
    exerciseId,
    exerciseName: paramExerciseName,
    category: paramCategory,
    weight: paramWeight,
    repetitions: paramRepetitions,
    restTimeSeconds: paramRestTimeSeconds,
    notes: paramNotes,
  } = useLocalSearchParams<{
    workoutId: string;
    exerciseId?: string;
    exerciseName?: string;
    category?: string;
    weight?: string;
    repetitions?: string;
    restTimeSeconds?: string;
    notes?: string;
  }>();
  
  
  const [category, setCategory] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [seriesCount, setSeriesCount] = useState(''); // nombre de séries en string
  const [repBySeries, setRepBySeries] = useState<string[]>([]);
  const [weightBySeries, setWeightBySeries] = useState<string[]>([]);
  const [restTimeSeconds, setRestTimeSeconds] = useState('');
  const [notes, setNotes] = useState('');
  const [customExercises, setCustomExercises] = useState<Record<string, string[]>>({});
  const params = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);

  // Fonction utilitaire pour convertir string CSV en tableau de string (plus simple que number ici pour garder l'exact)
  const toStringArray = (param?: string | string[]): string[] => {
    if (!param) return [];
    if (Array.isArray(param)) {
      return param[0].split(',');
    }
    return param.split(',');
  };
  useEffect(() => {
    if (paramExerciseName) setExerciseName(paramExerciseName);
  
    if (paramCategory) {
      setCategory(paramCategory);
    } else if (paramExerciseName) {
      // 💡 Si aucune catégorie passée, on la déduit depuis predefinedExercises
      const foundCategory = Object.entries(predefinedExercises).find(([cat, exercises]) =>
        exercises.includes(paramExerciseName)
      );
      if (foundCategory) {
        setCategory(foundCategory[0]);
      }
    }
  
    const repsFromParams = toStringArray(paramRepetitions);
    const weightFromParams = toStringArray(paramWeight);
  
    if (repsFromParams.length > 0 && repBySeries.length === 0) {
      setRepBySeries(repsFromParams);
    }
    if (weightFromParams.length > 0 && weightBySeries.length === 0) {
      setWeightBySeries(weightFromParams);
    }
  
    const maxLen = Math.max(repsFromParams.length, weightFromParams.length);
    if (maxLen > 0 && !seriesCount) setSeriesCount(String(maxLen));
    if (paramRestTimeSeconds) setRestTimeSeconds(paramRestTimeSeconds);
    if (paramNotes) setNotes(paramNotes);
  }, [paramExerciseName, paramCategory, paramWeight, paramRepetitions, paramRestTimeSeconds, paramNotes]);
  
  
  const { theme } = useTheme();
  const colors = getColors(theme);

  const predefinedExercises = {
    PUSH: ['Machine pec classique','Développé couché incliné','Developpé couche incline haltères','Smith machine devlp incline','Développé couché', 'Développé couché haltères' , 'Dips',],
    PULL: ['Tirage vertical machine','Tirage vertical Libre','Tirage horizontal une main','Tractions', 'Rowing barre', 'Rowing machine','Triceps vers le haut poulie','Triceps triché'],
    LEGS: ['Leg Curl','Hack Squat','Squat','Extension lombaire','Legs Extension','Abducteur','Adducteur','Fente avant', 'Soulevé de terre'],
    UPPER: ['Bench','Developpé couché incliné','Developpé couche incline haltères','Smith machine devlp incline' , 'Dips', 'Tractions','Rowing machine'],
    BRAS : ['Curl marteau','Curl assis','Triceps vers le haut poulie','Dips machine','Triceps triché','Avant Bras'],
  };

  const loadCustomExercises = async () => {
    const { data, error } = await supabase.from('custom_exercises').select('*');
    if (error) {
      console.error('Erreur chargement exercices personnalisés:', error);
      return;
    }

    const grouped: Record<string, string[]> = {};
    data.forEach((item: any) => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item.name);
    });

    setCustomExercises(grouped);
  };


 
  

  useEffect(() => {
    const fetchAndLoadExercise = async () => {
      // 💡 Évite le fetch si tu as déjà les données via params
      if (!exerciseId || (paramRepetitions || paramWeight)) {
        return;
      }
  
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();
  
      if (error || !data) {
        console.error('Erreur chargement exercice:', error);
        return;
      }
  
      setExerciseName(data.name);
      setCategory(data.category || paramCategory || '');
  
      if (!seriesCount) setSeriesCount(String(data.series || ''));
  
      if (repBySeries.length === 0 && data.repetitions?.length > 0) {
        setRepBySeries(data.repetitions);
      }
  
      if (weightBySeries.length === 0 && data.weight?.length > 0) {
        setWeightBySeries(data.weight);
      }
  
      if (!restTimeSeconds && data.rest_time_seconds !== null) {
        setRestTimeSeconds(String(data.rest_time_seconds));
      }
  
      if (!notes) {
        setNotes(data.notes || '');
      }
    };
  
    fetchAndLoadExercise();
  }, [exerciseId]);
  
  
  const fetchPreviousPerformance = async (exerciseName: string, workoutId: string) => {
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('created_at, weight, repetitions')
      .eq('name', exerciseName)
      .neq('workout_id', workoutId) // ⚠️ Exclure la séance en cours
      .order('created_at', { ascending: false })
      .limit(1); // 🆕 Récupère uniquement le dernier
  
    if (error || !data || data.length === 0) return null;
  
    const last = data[0];
  
    return {
      date: new Date(last.created_at).toLocaleDateString('fr-FR'),
      repetitions: last.repetitions,
      weight: last.weight,
    };
  };
  
  
  const [previousPerformance, setPreviousPerformance] = useState<null | {
    date: string;
    repetitions: number[];
    weight: number[];
  }>(null);
  
  useEffect(() => {
    if (exerciseName && workoutId) {
      fetchPreviousPerformance(exerciseName, workoutId).then((res) => {
        if (res) setPreviousPerformance(res);
      });
    }
  }, [exerciseName]);
  

  const loadSavedExercise = async () => {
    if (!workoutId || !exerciseName) return;
  
    const nameToSearch = exerciseName === 'CUSTOM' ? customExerciseName.trim() : exerciseName;
  
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .eq('name', nameToSearch)
      .single();
  
    if (error) {
      console.warn("Pas d'exercice trouvé (ce n'est pas une erreur si ajout)", error.message);
      return;
    }
  
    if (data) {
      setSeriesCount(String(data.series || ''));
      setRepBySeries(data.repetitions || []);
      setWeightBySeries(data.weight || []);
      setRestTimeSeconds(String(data.rest_time_seconds || ''));
      setNotes(data.notes || '');
    }
  };
  

  const getAllExercisesForCategory = (cat: string) => {
    const predefined = predefinedExercises[cat] || [];
    const custom = customExercises[cat] || [];
    return [...predefined, ...custom];
  };

  const onSeriesCountChange = (text: string) => {
    setSeriesCount(text);
  
    const count = parseInt(text, 10);
    if (!isNaN(count) && count > 0) {
      setRepBySeries((currentReps) =>
        Array.from({ length: count }, (_, i) => currentReps[i] || '')
      );
      setWeightBySeries((currentWeights) =>
        Array.from({ length: count }, (_, i) => currentWeights[i] || '')
      );
    } else {
      setRepBySeries([]);
      setWeightBySeries([]);
    }
  };
  
  

  const handleAddExercise = async () => {
    const finalExerciseName = exerciseName === 'CUSTOM' ? customExerciseName.trim() : exerciseName;
  
    if (!finalExerciseName || !seriesCount) {
      alert("Veuillez remplir le nom de l'exercice et le nombre de séries.");
      return;
    }
  
    if (exerciseName === 'CUSTOM' && category) {
      const { error: insertError } = await supabase.from('custom_exercises').insert([
        { name: finalExerciseName, category },
      ]);
      if (insertError) {
        console.error("Erreur ajout exercice personnalisé :", insertError);
      } else {
        await loadCustomExercises();
      }
    }
  
    const parsedReps = repBySeries.map((r) => {
      const n = parseInt(r);
      return isNaN(n) ? null : n;
    });
    
    const parsedWeights = weightBySeries.map((w) => {
      const n = parseFloat(w);
      return isNaN(n) ? null : n;
    });
    
  
    if (parsedReps.length === 0 && parsedWeights.length === 0) {
      alert('Veuillez remplir au moins une série avec répétitions ou poids.');
      return;
    }
  
    const newExercise = {
      name: finalExerciseName,
      series: parseInt(seriesCount),
      repetitions: parsedReps,
      weight: parsedWeights,
      rest_time_seconds: restTimeSeconds ? parseInt(restTimeSeconds) : null,
      notes,
      workout_id: workoutId,
    };
    
  
    let error;
  
    if (exerciseId) {
      // Si on a un id, on update
      const { error: updateError } = await supabase
        .from('workout_exercises')
        .update(newExercise)
        .eq('id', exerciseId);
      error = updateError;
    } else {
      // Sinon, on insert
      const { error: insertError } = await supabase.from('workout_exercises').insert([newExercise]);
      error = insertError;
    }
  
    if (error) {
      console.error("Erreur ajout/modification de l'exercice :", error);
      alert("Erreur lors de l'enregistrement.");
      return;
    }
  
    alert('Exercice enregistré avec succès.');
    router.back();
  };
  
// Fonction appelée quand on sélectionne dans le modal
const onSelectExercise = ({ category: cat, exercise: ex }) => {
  setCategory(cat);
  setExerciseName(ex);
  setCustomExerciseName('');
  setModalVisible(false);
};

// Composant modal intégré
const ModalPicker = ({ visible, onClose, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedExercise, setSelectedExercise] = useState(exerciseName || '');

  // Reset exercise quand la catégorie change
  const onCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedExercise('');
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Choisir un type d'exercice</Text>

          {/* Liste des catégories */}
          <FlatList
            data={Object.keys(predefinedExercises)}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === item && { backgroundColor: colors.accent },
                ]}
                onPress={() => onCategoryChange(item)}
              >
                <Text
                  style={{
                    color: selectedCategory === item ? 'white' : colors.text,
                    fontWeight: selectedCategory === item ? 'bold' : 'normal',
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Liste des exercices */}
          {selectedCategory ? (
            <FlatList
              data={[...getAllExercisesForCategory(selectedCategory), 'Autre (personnalisé)']}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => {
                const isCustom = item === 'Autre (personnalisé)';
                return (
                  <TouchableOpacity
                    style={[
                      styles.exerciseButton,
                      selectedExercise === (isCustom ? 'CUSTOM' : item) && {
                        backgroundColor: colors.accent,
                      },
                    ]}
                    onPress={() => setSelectedExercise(isCustom ? 'CUSTOM' : item)}
                  >
                    <Text
                      style={{
                        color:
                          selectedExercise === (isCustom ? 'CUSTOM' : item)
                            ? 'white'
                            : colors.text,
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <Text style={{ color: colors.placeholder, marginVertical: 10 }}>
              Sélectionnez une catégorie pour voir les exercices
            </Text>
          )}

          {/* Boutons action */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
            <Pressable onPress={onClose} style={styles.modalButtonCancel}>
              <Text style={{ color: colors.accent }}>Annuler</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!selectedCategory) return;
                if (!selectedExercise) return;
                onSelect({ category: selectedCategory, exercise: selectedExercise });
              }}
              style={[styles.modalButtonConfirm, { backgroundColor: colors.accent }]}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Valider</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.input }]}>
            {/* <ChevronLeft size={24} color={colors.accent} /> */}
            <Text style={{ color: colors.accent }}>{'<-'}</Text>
          </Pressable>
          {/* <Dumbbell size={28} color={colors.accent} style={{ marginRight: 8 }} /> */}
          <Text style={[styles.title, { color: colors.text }]}>Ajouter un exercice</Text>
        </View>

        <View style={[styles.formSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Type d'exercice</Text>
          <Pressable
  style={[
    styles.pickerWrapper,
    { backgroundColor: colors.input, borderColor: colors.inputBorder },
  ]}
  onPress={() => setModalVisible(true)}
>
  {category ? (
    <>
      <Text style={{ color: colors.placeholder, fontSize: 12 }}>
        {category}
      </Text>
      <Text style={{ color: colors.inputText, fontSize: 18, fontWeight: '600' }}>
        {exerciseName === 'CUSTOM' ? (customExerciseName || 'Nom personnalisé') : exerciseName || 'Choisir exercice'}
      </Text>
    </>
  ) : (
    <Text style={{ color: colors.placeholder, fontSize: 16 }}>
      Choisir un type d'exercice
    </Text>
  )}
</Pressable>


          {/* Modal */}
          <ModalPicker visible={modalVisible} onClose={() => setModalVisible(false)} onSelect={onSelectExercise} />

          {/* Ici tu gardes la sélection du nom d'exercice personnalisé comme avant */}
          {exerciseName === 'CUSTOM' && (
            <TextInput
              placeholder="Nom personnalisé de l'exercice"
              value={customExerciseName}
              onChangeText={setCustomExerciseName}
              style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
              placeholderTextColor={colors.placeholder}
            />
          )}


          <TextInput
            placeholder="Nombre de séries"
            value={seriesCount}
            onChangeText={onSeriesCountChange}
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
          />
{previousPerformance && (
  <View style={{ marginBottom: 16, padding: 12, backgroundColor: colors.input, borderRadius: 8 }}>
    <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>
      🕓 Dernière fois le {previousPerformance.date}
    </Text>
    {(previousPerformance.repetitions ?? []).map((rep, idx) => (
      <Text key={idx} style={{ color: colors.subtext }}>
        Série {idx + 1} : {rep} reps - {(previousPerformance.weight ?? [])[idx] || 0} kg
      </Text>
    ))}
  </View>
)}



          {repBySeries.map((rep, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={[styles.label, { color: colors.text }]}>Série {index + 1}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  placeholder="Répétitions"
                  value={rep}
                  onChangeText={(text) => {
                    const updated = [...repBySeries];
                    updated[index] = text;
                    setRepBySeries(updated);
                  }}
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1, backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholderTextColor={colors.placeholder}
                />
                <TextInput
                  placeholder="Poids"
                  value={weightBySeries[index]}
                  onChangeText={(text) => {
                    const updated = [...weightBySeries];
                    updated[index] = text;
                    setWeightBySeries(updated);
                  }}
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1, backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>
          ))}

          <View style={{ marginBottom: 15 }}>
            <Text style={[styles.label, { color: colors.text }]}>Repos (sec)</Text>
            <TextInput
              placeholder="ex: 90"
              value={restTimeSeconds}
              onChangeText={setRestTimeSeconds}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <TextInput
            placeholder="Commentaires"
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
            placeholderTextColor={colors.placeholder}
          />

          <Pressable style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={handleAddExercise}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Enregistrer</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddExerciseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  title: {
    fontWeight: '700',
    fontSize: 20,
  },
  formSection: {
    padding: 16,
    margin: 10,
    borderRadius: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,  // plus large
    paddingVertical: 18,    // plus haut
    marginBottom: 16,
    justifyContent: 'center', // centre verticalement le texte
  },
  
  picker: {
    height: 50,
    width: '100%',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  exerciseButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 4,
  },
  modalButtonCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  modalButtonConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
