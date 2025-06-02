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
  const { data, error } = await supabase.from('workouts').select('*').order('created_at', { ascending: false });
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.buttonText}>🎮 Nouvelle Séance</Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0f0" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={paginatedSessions}
          renderItem={({ item }) => (
            <View style={styles.sessionContainer}>
              <Text style={styles.sessionName}>🕹️ {item.name}</Text>
              <Text style={styles.sessionDate}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                activeOpacity={0.6}
                  style={styles.smallButton}
                  onPress={() => router.push(`/workout/${item.id}/add-exercise` as any)}
                >
                  <Text style={styles.buttonText}>➕ Exercices</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => router.push(`/workout/${item.id}/exercises` as any)}
                >
                  <Text style={styles.buttonText}>📋 Voir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
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
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            <Text style={styles.buttonText}>⬅️</Text>
          </TouchableOpacity>
          <Text style={styles.pageIndicator}>Page {currentPage}</Text>
          <TouchableOpacity
            onPress={() =>
              setCurrentPage((prev) =>
                prev < Math.ceil(sessions.length / itemsPerPage)
                  ? prev + 1
                  : prev
              )
            }
            disabled={currentPage >= Math.ceil(sessions.length / itemsPerPage)}
            style={styles.pageButton}
          >
            <Text style={styles.buttonText}>➡️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  sessionContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#0f3460',
    shadowColor: '#0f0',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  sessionDate: {
    fontSize: 12,
    color: '#c0c0c0',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  mainButton: {
    backgroundColor: '#533483',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#0f3460',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 4,
    
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    alignItems: 'center',
  },
  pageButton: {
    backgroundColor: '#533483',
    padding: 10,
    borderRadius: 5,
    width: 60,
    alignItems: 'center',
  },
  pageIndicator: {
    fontFamily: 'monospace',
    color: '#ffffff',
  },
});

export default WorkoutSessionsScreen;
