import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode as atob } from 'base-64';

import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeContext';
import { getColors } from '../../lib/theme-colors';
import { Buffer } from 'buffer'; // Ajoute cette ligne en haut du fichier (npm install buffer si besoin)

type Profile = {
  id: string;
  email: string | null;
  username: string | null;
  weight_goal: number | null;
  current_weight: number | null;
  height: number | null;
  daily_calorie_goal: number | null;
  avatar_url?: string | null;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const colors = getColors(theme);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError ?? new Error('Utilisateur non connecté');

      const { data, error: dbError } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (dbError) throw dbError;

      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);



  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie.');
        return;
      }
  
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
  
      if (pickerResult.canceled) return;
  
      const file = pickerResult.assets[0];
      if (!file?.uri) throw new Error("Image non valide");
  
      setUploading(true);
  
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.id) throw new Error("Utilisateur non connecté");
  
      const filePath = `${user.id}/${Date.now()}.jpg`;
  
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const byteArray = Uint8Array.from(Buffer.from(base64, 'base64'));
  
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, byteArray, {
          contentType: 'image/jpeg',
          upsert: true,
        });
  
      if (uploadError) throw uploadError;
  
      const { data: publicUrlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
  
      const avatar_url = publicUrlData?.publicUrl;
      if (!avatar_url) throw new Error("Impossible d'obtenir l'URL publique");
  
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      setProfile(prev => prev ? { ...prev, avatar_url } : prev);
  
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setUploading(false);
    }
  };
  
  
  

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 10, color: colors.text }}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={22} color={colors.accent} />
              <Switch
                value={theme === 'dark'}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                thumbColor={Platform.OS === 'android' ? colors.accent : undefined}
                trackColor={{ false: '#ccc', true: colors.accent }}
              />
            </View>
            <Pressable onPress={() => router.push('/EditProfileScreen')}>
              <MaterialIcons name="settings" size={24} color={colors.accent} />
            </Pressable>
          </View>

          <View style={styles.profile}>
            <Pressable onPress={handlePickImage} style={{ position: 'relative' }}>
              <Image
                source={{
                  uri: profile?.avatar_url || 'https://placehold.co/110x110',
                }}
                style={styles.profileImage}
              />
              <View style={styles.cameraIcon}>
                <MaterialIcons name="photo-camera" size={18} color="#fff" />
              </View>
              {uploading && (
                <ActivityIndicator
                  size="small"
                  color={colors.accent}
                  style={StyleSheet.absoluteFill}
                />
              )}
            </Pressable>
            <Text style={[styles.profileName, { color: colors.text }]}>{profile?.username || 'Utilisateur'}</Text>
            <Text style={[styles.profileStats, { color: colors.subtext }]}>
              {profile?.current_weight ? `Poids actuel : ${profile.current_weight} lbs` : 'Pas de donnée de poids'}
              {' • '}
              {profile?.daily_calorie_goal ? `Objectif calories : ${profile.daily_calorie_goal}` : ''}
            </Text>
          </View>
        </View>
        <View style={[styles.section, { backgroundColor: colors.section }] }>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievements}>
            <Achievement
              title="First Week"
              description="Completed your first week"
              color={colors.accent}
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
        <View style={[styles.section, { backgroundColor: colors.section }] }>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress</Text>
          <Pressable style={styles.menuItem}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Weight History</Text>
            <Feather name="chevron-right" size={20} color={colors.subtext} />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Measurements</Text>
            <Feather name="chevron-right" size={20} color={colors.subtext} />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Progress Photos</Text>
            <Feather name="chevron-right" size={20} color={colors.subtext} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 20, marginVertical: 30 }}>
          <Pressable
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace('/login'); // replace() pour éviter retour arrière
            }}
            style={{
              backgroundColor: colors.error,
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
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#007aff', borderRadius: 20, padding: 4
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
