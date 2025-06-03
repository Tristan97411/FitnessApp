import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../app/_layout';
import { useRouter } from 'expo-router'; // Utilisation correcte de useRouter
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Platform } from 'react-native';
import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router'; // Gestion des paramètres
import { Search, Barcode } from "lucide-react-native";

type Meal = {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  created_at: string;
};


export default function AddScreen() {
  const [mealDate, setMealDate] = useState(new Date());
  const params = useLocalSearchParams(); // Paramètres de l'URL

  const { session } = useAuthStore();
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFat, setMealFat] = useState('');

  const [mealType, setMealType] = useState('breakfast'); // Type par défaut
  const [history, setHistory] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter(); // Initialisation du router pour la navigation
  useEffect(() => {
    if (!session) {
      alert("Veuillez vous connecter.");
      router.push('/auth/login'); // Rediriger vers la page de connexion si non connecté
    }
  }, [session]);
  
  // Récupère l'historique des repas ajoutés par l'utilisateur
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setHistory(data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique", err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue !');
    } finally {
      setLoading(false);
    }
  };

  // Pré-remplir les champs du formulaire si des paramètres sont passés (via le scanner)
  useEffect(() => {
    if (params.name) setMealName(params.name as string);
    if (params.calories) setMealCalories(params.calories as string);
    if (params.protein) setMealProtein(params.protein as string);
    if (params.carbs) setMealCarbs(params.carbs as string);
    if (params.fat) setMealFat(params.fat as string);
  }, [params]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

const showDatePicker = () => setDatePickerVisibility(true);
const hideDatePicker = () => setDatePickerVisibility(false);
const handleConfirm = (date: Date) => {
  setMealDate(date);
  hideDatePicker();
};


  const handleAddMeal = async () => {
    if (!mealName || !mealCalories) {
      alert("Veuillez remplir le nom du repas et les calories.");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.from('meals').insert({
        user_id: session?.user.id,
        name: mealName,
        calories: parseFloat(mealCalories),
        protein: parseFloat(mealProtein),
        carbs: parseFloat(mealCarbs),
        fat: parseFloat(mealFat),
        meal_type: mealType,
        created_at: mealDate.toISOString(),
      });
      if (error) throw error;
      
      setMealName('');
      setMealCalories('');
      setMealProtein('');
      setMealCarbs('');
      setMealFat('');
      
      fetchHistory(); // Met à jour l'historique des repas
      router.push('/diary'); // Redirige vers le journal après l'ajout
    } catch (err) {
      console.error("Erreur lors de l'ajout du repas:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ajouter un repas</Text>
        </View>

        {/* Barre de recherche (optionnelle) */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher des aliments..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable style={styles.barcodeButton} onPress={() => router.push('/scan')}>
            <Barcode size={24} color="#007AFF" />
          </Pressable>
        </View>

        {/* Formulaire d'ajout */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom du repas"
            value={mealName}
            onChangeText={setMealName}
          />
          <TextInput
            style={styles.input}
            placeholder="Calories"
            value={mealCalories}
            onChangeText={setMealCalories}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Protéines"
            value={mealProtein}
            onChangeText={setMealProtein}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Glucides"
            value={mealCarbs}
            onChangeText={setMealCarbs}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Lipides"
            value={mealFat}
            onChangeText={setMealFat}
            keyboardType="numeric"
          />
          {/* Choix du type de repas */}
          <View style={styles.mealTypeContainer}>
            <Pressable
              style={[styles.mealTypeButton, mealType === 'breakfast' && styles.mealTypeButtonSelected]}
              onPress={() => setMealType('breakfast')}
            >
              <Text style={styles.mealTypeText}>Petit déjeuner</Text>
            </Pressable>
            <Pressable
              style={[styles.mealTypeButton, mealType === 'lunch' && styles.mealTypeButtonSelected]}
              onPress={() => setMealType('lunch')}
            >
              <Text style={styles.mealTypeText}>Déjeuner</Text>
            </Pressable>
            <Pressable
              style={[styles.mealTypeButton, mealType === 'dinner' && styles.mealTypeButtonSelected]}
              onPress={() => setMealType('dinner')}
            >
              <Text style={styles.mealTypeText}>Dîner</Text>
            </Pressable>
            <Pressable
              style={[styles.mealTypeButton, mealType === 'snack' && styles.mealTypeButtonSelected]}
              onPress={() => setMealType('snack')}
            >
              <Text style={styles.mealTypeText}>La Collation</Text>
            </Pressable>
          </View>
          <Pressable onPress={showDatePicker} style={styles.datePickerButton}>
  <Text style={styles.datePickerText}>Date : {format(mealDate, 'dd/MM/yyyy')}</Text>
</Pressable>     
            <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
          
         

          <Pressable style={styles.saveButton} onPress={handleAddMeal}>
            <Text style={styles.saveButtonText}>Enregistrer le repas</Text>
          </Pressable>
          {loading && <ActivityIndicator size="small" color="#007AFF" />}
          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        {/* Historique des repas ajoutés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des repas</Text>
          {history.map((meal) => (
            <View key={meal.id} style={styles.historyItem}>
              <Text style={styles.historyName}>{meal.name}</Text>
              <View style={styles.macroRow}>
                <Text style={styles.macroText}>⚡ {meal.calories} cal</Text>
                <Text style={styles.macroText}>🥩 {meal.protein}g</Text>
                <Text style={styles.macroText}>🍞 {meal.carbs}g</Text>
                <Text style={styles.macroText}>🧈 {meal.fat}g</Text>
              </View>
              <Text style={styles.historyDetails}>
                {meal.calories} cal - {meal.protein}g prot - {meal.carbs}g gluc - {meal.fat}g lip | {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)} - {format(new Date(meal.created_at), 'dd/MM/yyyy')}
              </Text>
            </View>
          ))}
          {history.length === 0 && <Text style={styles.noHistory}>Aucun repas ajouté pour le moment.</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 24, color: '#1C1C1E' },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, paddingVertical: 12, marginLeft: 8 },
  barcodeButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: { padding: 20, backgroundColor: '#FFFFFF' },
  input: {
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  mealTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  mealTypeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  mealTypeButtonSelected: { backgroundColor: '#007AFF' },
  mealTypeText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  section: { backgroundColor: '#FFFFFF', marginTop: 20, padding: 20 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#1C1C1E', marginBottom: 15 },
  historyItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  historyName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1C1C1E' },
  historyDetails: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8E8E93' },
  noHistory: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8E8E93', textAlign: 'center' },
  error: { color: '#FF3B30', textAlign: 'center', marginTop: 10 },
  datePickerButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  datePickerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1C1C1E',
  },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
macroText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#555' },

  
});
