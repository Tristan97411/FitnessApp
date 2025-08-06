import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WorkoutSessionForm } from '../components/WorkoutSessionForm';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Pressable } from 'react-native';
import { Dumbbell, PlusCircle, ChevronLeft, ClipboardList, ChevronRight, ChevronLeft as ArrowLeft, ChevronRight as ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../lib/ThemeContext';
import { getColors } from '../../lib/theme-colors';

type Workout = {
  name: string;
};

type WorkoutSessionsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkoutSessions'
>;

const addWorkoutSession = async (workout: Workout) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Erreur utilisateur:', userError);
    return;
  }

  const { data, error } = await supabase.from('workouts').insert([
    { name: workout.name, user_id: user.id },
  ]);

  if (error) {
    console.error('Erreur insertion séance:', error);
    return;
  }

  console.log('Séance ajoutée:', data);
  return data;
};

const fetchSessions = async (): Promise<any[]> => {
  // 👉 ici tu remplaces ce code :
  // 👇 par CE NOUVEAU CODE
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Erreur utilisateur:', userError);
    return [];
  }

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id) // 🔥 la ligne importante !
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur récupération séances:', error);
    return [];
  }

  return data || [];
};

  

  


export const WorkoutSessionsScreen = () => {
  const router = useRouter();
  const navigation = useNavigation<WorkoutSessionsScreenNavigationProp>();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { theme } = useTheme();
  const colors = getColors(theme);

  const paginatedSessions = sessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      const data = await fetchSessions();
      setSessions(data);
      setIsLoading(false);
    };
    loadSessions();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }] }>
          <Dumbbell size={28} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: colors.text }]}>Mes séances</Text>
        </View>
        <Pressable
          style={[styles.mainButton, { backgroundColor: colors.button }]}
          onPress={() => setIsModalVisible(true)}
        >
          <PlusCircle size={20} color={colors.buttonText} style={{ marginRight: 8 }} />
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>Nouvelle Séance</Text>
        </Pressable>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
        ) : (
          <View style={[styles.sessionsSection, { backgroundColor: colors.card }] }>
            {paginatedSessions.length === 0 ? (
              <Text style={[styles.noSessionText, { color: colors.subtext }]}>Aucune séance trouvée.</Text>
            ) : (
              paginatedSessions.map((item) => (
                <View style={[styles.sessionContainer, { backgroundColor: colors.section, borderColor: colors.border, shadowColor: colors.shadowAccent }] } key={item.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <ClipboardList size={20} color={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={[styles.sessionName, { color: colors.accent }]}>{item.name}</Text>
                  </View>
                  <Text style={[styles.sessionDate, { color: colors.subtext }]}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                  <View style={styles.buttonRow}>
                    <Pressable
                      style={[styles.smallButton, { backgroundColor: colors.button }]}
                      onPress={() => router.push(`/workout/${item.id}/add-exercise` as any)}
                    >
                      <PlusCircle size={16} color={colors.buttonText} style={{ marginRight: 4 }} />
                      <Text style={[styles.buttonText, { color: colors.buttonText }]}>Exercices</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.smallButton, { backgroundColor: colors.button }]}
                      onPress={() => router.push(`/workout/${item.id}/exercises` as any)}
                    >
                      <ClipboardList size={16} color={colors.buttonText} style={{ marginRight: 4 }} />
                      <Text style={[styles.buttonText, { color: colors.buttonText }]}>Voir</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <WorkoutSessionForm
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={async (session) => {
            await addWorkoutSession(session);
            setIsLoading(true);
            const updatedSessions = await fetchSessions();
            setSessions(updatedSessions);
            setIsLoading(false);
          }}
        />

        {!isLoading && (
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={[styles.pageButton, { backgroundColor: colors.card }, currentPage === 1 && styles.pageButtonDisabled]}
            >
              <ArrowLeft size={18} color={currentPage === 1 ? colors.disabled : colors.accent} />
            </Pressable>
            <Text style={[styles.pageIndicator, { color: colors.text }]}>Page {currentPage}</Text>
            <Pressable
              onPress={() =>
                setCurrentPage((prev) =>
                  prev < Math.ceil(sessions.length / itemsPerPage)
                    ? prev + 1
                    : prev
                )
              }
              disabled={currentPage >= Math.ceil(sessions.length / itemsPerPage)}
              style={[styles.pageButton, { backgroundColor: colors.card }, currentPage >= Math.ceil(sessions.length / itemsPerPage) && styles.pageButtonDisabled]}
            >
              <ArrowRight size={18} color={currentPage >= Math.ceil(sessions.length / itemsPerPage) ? colors.disabled : colors.accent} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#1C1C1E',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    margin: 20,
    justifyContent: 'center',
    marginBottom: 20,
  },
  sessionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sessionContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#007AFF',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#007AFF',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  pageButton: {
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 8,
    width: 40,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pageButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  pageIndicator: {
    fontFamily: 'Inter_400Regular',
    color: '#1C1C1E',
    fontSize: 16,
  },
  noSessionText: {
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
});

export default WorkoutSessionsScreen;
