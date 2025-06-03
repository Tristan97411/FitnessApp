import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import {useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  MaterialIcons, 
  FontAwesome5, 
  MaterialCommunityIcons,
  Feather, 
  Ionicons 
} from '@expo/vector-icons';


type Profile = {
  id: string;
  email: string | null;
  username: string | null;
  weight_goal: number | null;
  current_weight: number | null;
  height: number | null;
  daily_calorie_goal: number | null;
  created_at: string;
  updated_at: string;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des données de l'utilisateur connecté
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Aucun utilisateur connecté.");

        const { data, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (dbError) throw dbError;
        setProfile(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
          setLoading(false);
        }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFredF" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            {/* On ajoute onPress pour naviguer vers EditProfileScreen */}
            <Pressable onPress={() => router.push('/EditProfileScreen')}>
<MaterialIcons name="settings" size={24} color="#007AFF" />
            </Pressable>
          </View>
          
          <View style={styles.profile}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60' }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{profile?.username || 'Utilisateur'}</Text>
            <Text style={styles.profileStats}>
              {profile?.current_weight ? `Current Weight: ${profile.current_weight} lbs` : 'Pas de donnée de poids'} • 
              {profile?.daily_calorie_goal ? ` Daily Calorie Goal: ${profile.daily_calorie_goal}` : ''}
            </Text>
          </View>
        </View>

        {/* Reste de la page... */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <View style={styles.goals}>
            <View style={styles.goalItem}>
              <FontAwesome5 name="bullseye" size={24} color="#007AFF" />
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>Weight Goal</Text>
                <Text style={styles.goalValue}>
                  {profile?.weight_goal ? `${profile.weight_goal} lbs` : 'Non défini'}
                </Text>
              </View>
            </View>
            <View style={styles.goalItem}>
              <MaterialCommunityIcons name="scale-bathroom"  size={24} color="#FF9500" />
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>Current Weight</Text>
                <Text style={styles.goalValue}>
                  {profile?.current_weight ? `${profile.current_weight} lbs` : 'Non défini'}
                </Text>
              </View>
            </View>
            <View style={styles.goalItem}>
              <MaterialIcons name="trending-up" size={24} color="#34C759" />
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>Weekly Goal</Text>
                <Text style={styles.goalValue}>-1 lb/week</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievements}>
            <Achievement
              title="First Week"
              description="Completed your first week"
              color="#007AFF"
            />
            <Achievement
              title="5lb Milestone"
              description="Lost your first 5 pounds"
              color="#FF9500"
            />
            <Achievement
              title="Workout Warrior"
              description="5 workouts in a week"
              color="#34C759"
            />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuItemText}>Weight History</Text>
            <Feather name="chevron-right" size={20} color="#8E8E93" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuItemText}>Measurements</Text>
            <Feather name="chevron-right" size={20} color="#8E8E93" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuItemText}>Progress Photos</Text>
            <Feather name="chevron-right" size={20} color="#8E8E93" />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 20, marginVertical: 30 }}>
  <Pressable
    onPress={async () => {
      await supabase.auth.signOut();
      router.replace('/login'); // replace() pour éviter retour arrière
    }}
    style={{
      backgroundColor: '#FF3B30',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
      Se déconnecter
    </Text>
  </Pressable>
</View>

      </ScrollView>
    </SafeAreaView>
  );
}

function Achievement({ title, description, color }: { title: string; description: string; color: string }) {
  return (
    <View style={[styles.achievement, { borderColor: color }]}>
      <FontAwesome5 name="award" size={24} color={color} />
      <Text style={styles.achievementTitle}>{title}</Text>
      <Text style={styles.achievementDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#1C1C1E',
  },
  profile: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#1C1C1E',
    marginBottom: 5,
  },
  profileStats: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1C1C1E',
    marginBottom: 15,
  },
  goals: {
    gap: 15,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  goalValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1C1C1E',
  },
  achievements: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  achievement: {
    width: 160,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 15,
    alignItems: 'center',
  },
  achievementTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1C1C1E',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuItemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1C1C1E',
  },
  error: {
    fontFamily: 'Inter_400Regular',
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});
