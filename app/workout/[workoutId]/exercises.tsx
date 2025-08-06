import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Pressable, StyleSheet, View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { PlusCircle, ChevronLeft, BarChart2 } from 'lucide-react-native';
import { useTheme } from '../../../lib/ThemeContext';
import { getColors } from '../../../lib/theme-colors';

export default function WorkoutExerciseListScreen() {
  const { workoutId } = useLocalSearchParams();
  const [exercises, setExercises] = useState<any[]>([]);
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const predefinedExercises: Record<string, string[]> = {
    PUSH: ['Machine pec classique','Développé couché incliné','Developpé couche incline haltères','Smith machine devlp incline','Développé couché', 'Développé couché haltères' , 'Dips'],
    PULL: ['Tirage vertical machine','Tirage vertical Libre','Tirage horizontal une main','Tractions', 'Rowing barre', 'Rowing machine','Triceps vers le haut poulie','Triceps triché'],
    LEGS: ['Leg Curl','Hack Squat','Squat','Extension lombaire','Legs Extension','Abducteur','Adducteur','Fente avant', 'Soulevé de terre'],
    UPPER: ['Bench','Developpé couché incliné','Developpé couche incline haltères','Smith machine devlp incline' , 'Dips', 'Tractions','Rowing machine'],
    BRAS: ['Curl marteau','Curl assis','Triceps vers le haut poulie','Dips machine','Triceps triché','Avant Bras'],
  };
  
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }] }>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.input }] }>
            <ChevronLeft size={24} color={colors.accent} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Exercices de la séance</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }] }>
          {exercises.length === 0 ? (
            <Text style={[styles.noExerciseText, { color: colors.subtext }]}>Aucun exercice ajouté pour cette séance.</Text>
          ) : (
            exercises.map((item) => (
              <View style={[styles.card, { backgroundColor: colors.section, borderColor: colors.border, shadowColor: colors.shadowAccent }] } key={item.id}>
                <Text style={[styles.exerciseName, { color: colors.accent }]}>{item.name}</Text>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.subtext }]}>Séries :</Text>
                  <Text style={[styles.value, { color: colors.text }]}>{item.series}</Text>
                </View>
                <View style={styles.row}>
  <Text style={[styles.label, { color: colors.subtext }]}>Répétitions :</Text>
  <View style={styles.tagContainer}>
    {Array.isArray(item.repetitions) && Array.isArray(item.weight)
      ? item.repetitions.map((rep, idx) => (
          <View key={idx} style={[styles.tag, { backgroundColor: colors.input }]}>
            <Text style={[styles.tagText, { color: colors.text }]}>
              {rep} reps - {item.weight[idx] ?? '-'} kg
            </Text>
          </View>
        ))
      : (
          <View style={[styles.tag, { backgroundColor: colors.input }]}>
            <Text style={[styles.tagText, { color: colors.text }]}>
              {item.repetitions} reps - {item.weight} kg
            </Text>
          </View>
        )
    }
  </View>
</View>

                {item.notes ? (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.subtext }]}>Commentaires :</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{item.notes}</Text>
                  </View>
                  
                ) : null}
                {item.restTimeSeconds ? (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.subtext }]}>Commentaires :</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{item.restTimeSeconds}</Text>
                  </View>
                  
                ) : null}
                 <Pressable
      style={[styles.editButton, { backgroundColor: colors.button }]}
      onPress={() => {
        // Trouver la catégorie correspondant à l'exercice
        const foundCategory = Object.entries(predefinedExercises).find(([key, values]) =>
          values.includes(item.name)
        )?.[0] || '';
      
        router.push({
          pathname: `/workout/${workoutId}/add-exercise`,
          params: {
            exerciseName: item.name,
            exerciseId: item.id,
            category: foundCategory, // ← maintenant défini dynamiquement
            weight: Array.isArray(item.weight) ? item.weight.join(',') : item.weight?.toString() || '',
            repetitions: Array.isArray(item.repetitions) ? item.repetitions.join(',') : item.repetitions?.toString() || '',
            restTimeSeconds: item.rest_time_seconds?.toString() || '',
      notes: item.notes || '',
          },
        });
      }}
      
      
      
    >
      <Text style={[styles.editButtonText, { color: colors.buttonText }]}>Modifier</Text>
    </Pressable>
                <Pressable
                  style={[styles.progressButton, { backgroundColor: colors.button }]}
                  onPress={() => router.push(`/progress/${item.name}` as any)}
                >
                  <BarChart2 size={16} color={colors.buttonText} style={{ marginRight: 6 }} />
                  <Text style={[styles.progressButtonText, { color: colors.buttonText }]}>Voir la progression</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Pressable
  onPress={() => router.push(`/workout/${workoutId}/add-exercise` as any)}
  style={[styles.addButton, { backgroundColor: colors.button }]}
>
  <PlusCircle size={20} color={colors.buttonText} style={{ marginRight: 8 }} />
  <Text style={[styles.addButtonText, { color: colors.buttonText }]}>Ajouter un exercice</Text>
</Pressable>

                 </ScrollView>
               </SafeAreaView>
             );
           }
           
           const styles = StyleSheet.create({
             container: { flex: 1, backgroundColor: '#F2F2F7' },
             header: {
               flexDirection: 'row',
               alignItems: 'center',
               backgroundColor: '#FFFFFF',
               padding: 20,
               borderBottomWidth: 1,
               borderBottomColor: '#E5E5EA',
               marginBottom: 10,
             },
             backButton: {
               marginRight: 8,
               backgroundColor: '#F2F2F7',
               borderRadius: 8,
               padding: 4,
             },
             title: {
               fontFamily: 'Inter_600SemiBold',
               fontSize: 22,
               color: '#1C1C1E',
               flex: 1,
             },
             section: {
               backgroundColor: '#FFFFFF',
               borderRadius: 12,
               padding: 20,
               margin: 16,
               marginTop: 0,
             },
             card: {
               backgroundColor: '#F2F2F7',
               borderRadius: 10,
               padding: 16,
               marginBottom: 16,
               borderWidth: 1,
               borderColor: '#E5E5EA',
               shadowColor: '#007AFF',
               shadowOpacity: 0.08,
               shadowRadius: 6,
               elevation: 2,
             },
             exerciseName: {
               fontFamily: 'Inter_600SemiBold',
               fontSize: 18,
               color: '#007AFF',
               marginBottom: 8,
             },
             row: {
               flexDirection: 'row',
               marginBottom: 4,
             },
             label: {
               fontFamily: 'Inter_400Regular',
               color: '#8E8E93',
               fontSize: 15,
               width: 120,
             },
             value: {
               fontFamily: 'Inter_400Regular',
               color: '#1C1C1E',
               fontSize: 15,
             },
             progressButton: {
               flexDirection: 'row',
               alignItems: 'center',
               backgroundColor: '#007AFF',
               padding: 10,
               borderRadius: 8,
               justifyContent: 'center',
               marginTop: 10,
             },
             progressButtonText: {
               color: '#fff',
               fontFamily: 'Inter_600SemiBold',
               fontSize: 15,
             },
             addButton: {
               flexDirection: 'row',
               alignItems: 'center',
               backgroundColor: '#007AFF',
               padding: 16,
               borderRadius: 10,
               justifyContent: 'center',
               marginHorizontal: 16,
               marginBottom: 30,
               marginTop: 10,
             },
             addButtonText: {
               color: '#fff',
               fontFamily: 'Inter_600SemiBold',
               fontSize: 16,
             },
             noExerciseText: {
               fontFamily: 'Inter_400Regular',
               color: '#8E8E93',
               textAlign: 'center',
               marginVertical: 20,
               fontSize: 16,
             },
             editButton: {
              marginTop: 10,
              padding: 10,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            },
            editButtonText: {
              fontFamily: 'Inter_600SemiBold',
              fontSize: 15,
            },
            tagContainer: {
              flexDirection: 'column',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 4,
            },
            
            tag: {
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 6,
              backgroundColor: '#E5E5EA',
            },
            
            tagText: {
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: '#1C1C1E',
            },
            
           });
           