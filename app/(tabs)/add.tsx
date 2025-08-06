import { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '../../lib/ThemeContext';
import { getColors } from '../../lib/theme-colors';

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
  const [mealQuantity, setMealQuantity] = useState('100'); // quantité en grammes
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const router = useRouter(); // Initialisation du router pour la navigation
  useEffect(() => {
    if (!session) {
      alert("Veuillez vous connecter.");
      router.push('/auth/login'); // Rediriger vers la page de connexion si non connecté
    }
  }, [session]);
  
  const baseMacros = useRef({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  const resetForm = () => {
    setMealName('');
    setMealQuantity('100');
    setMealCalories('');
    setMealProtein('');
    setMealCarbs('');
    setMealFat('');
    baseMacros.current = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  };
  const [originalMealData, setOriginalMealData] = useState<{
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  } | null>(null);
  
  const handleResetValues = () => {
    setMealQuantity('100');
  
    const { calories, protein, carbs, fat } = baseMacros.current;
    setMealCalories(calories.toString());
    setMealProtein(protein.toString());
    setMealCarbs(carbs.toString());
    setMealFat(fat.toString());
  };
  

  
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
  
      if (fetchError) throw fetchError;
  
      const trimmed = data?.slice(0, 20) || [];
      setHistory(trimmed);
  
      // Supprimer les anciens repas (plus de 20)
      const toDelete = data?.slice(20);
      if (toDelete?.length) {
        const idsToDelete = toDelete.map(m => m.id);
        await supabase.from('meals').delete().in('id', idsToDelete);
      }
  
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique", err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue !!');
    } finally {
      setLoading(false);
    }
  };
  

  // Pré-remplir les champs du formulaire si des paramètres sont passés (via le scanner)
  useEffect(() => {
    if (!params) return;
  
    if (params.name) setMealName(String(params.name));
    if (params.calories) setMealCalories(String(params.calories));
    if (params.protein) setMealProtein(String(params.protein));
    if (params.carbs) setMealCarbs(String(params.carbs));
    if (params.fat) setMealFat(String(params.fat));
  
    if (params.calories || params.protein || params.carbs || params.fat) {
      const original = {
        calories: parseFloat(params.calories as string).toFixed(2),
        protein: parseFloat(params.protein as string).toFixed(2),
        carbs: parseFloat(params.carbs as string).toFixed(2),
        fat: parseFloat(params.fat as string).toFixed(2),
      };
    
      baseMacros.current = {
        calories: parseFloat(original.calories),
        protein: parseFloat(original.protein),
        carbs: parseFloat(original.carbs),
        fat: parseFloat(original.fat),
      };
    
      // 🧠 🔧 Ajout essentiel :
      setOriginalMealData({
        calories: original.calories,
        protein: original.protein,
        carbs: original.carbs,
        fat: original.fat,
      });
    
      console.log("Macros originales définies via scan :", original);
    }
    
    
  
  }, [params?.name, params?.calories, params?.protein, params?.carbs, params?.fat]);
  
  
  

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

const updateNutritionalValues = (baseValue: string, quantity: string) => {
  const base = parseFloat(baseValue);
  const qty = parseFloat(quantity);
  if (isNaN(base) || isNaN(qty)) return '0';
  return ((base / 100) * qty).toFixed(2);
};


const prevQuantity = useRef<string | null>(null);

useEffect(() => {
  if (!originalMealData) return;

  // Parse les valeurs en float une seule fois
  const caloriesBase = parseFloat(originalMealData.calories);
  const proteinBase = parseFloat(originalMealData.protein);
  const carbsBase = parseFloat(originalMealData.carbs);
  const fatBase = parseFloat(originalMealData.fat);

  const quantityNum = parseFloat(mealQuantity);

  if (isNaN(quantityNum)) {
    // Si quantité invalide, on remet à zéro
    setMealCalories('0');
    setMealProtein('0');
    setMealCarbs('0');
    setMealFat('0');
    return;
  }

  // Calcul des macros selon la quantité
  const calcMacros = (base: number) => ((base * quantityNum) / 100).toFixed(2);

  setMealCalories(calcMacros(caloriesBase));
  setMealProtein(calcMacros(proteinBase));
  setMealCarbs(calcMacros(carbsBase));
  setMealFat(calcMacros(fatBase));
  console.log('Recalcul macros avec :', {
    quantityNum,
    calories: calcMacros(caloriesBase),
    protein: calcMacros(proteinBase),
    carbs: calcMacros(carbsBase),
    fat: calcMacros(fatBase),
  });
  
}, [mealQuantity, originalMealData]);






const handleReuseMeal = (meal: Meal) => {
  setMealName(meal.name);
  setMealQuantity('100');

  // Sauvegarde les macros d'origine (pour 100g)
  baseMacros.current = {
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
  };

  // Stocke dans originalMealData pour déclencher le recalcul via useEffect
  setOriginalMealData({
    calories: meal.calories.toString(),
    protein: meal.protein.toString(),
    carbs: meal.carbs.toString(),
    fat: meal.fat.toString(),
  });

  // Affiche les macros pour 100g
  setMealCalories(meal.calories.toString());
  setMealProtein(meal.protein.toString());
  setMealCarbs(meal.carbs.toString());
  setMealFat(meal.fat.toString());
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
      setSelectedMeal(null);
    } catch (err) {
      console.error("Erreur lors de l'ajout du repa:", err);
    } finally {
      setLoading(false);
    }
  };

  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      <ScrollView>
        {/* En-tête */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }] }>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ajouter un repas</Text>
        </View>

        {/* Barre de recherche (optionnelle) */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }] }>
          <View style={[styles.searchBar, { backgroundColor: colors.input }] }>
            <Search size={20} color={colors.placeholder} />
            <TextInput
              style={[styles.searchInput, { color: colors.inputText }]}
              placeholder="Rechercher des aliments..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable style={[styles.barcodeButton, { backgroundColor: colors.input }] } onPress={() => router.push('/scan')}>
            <Barcode size={24} color={colors.accent} />
          </Pressable>
        </View>

        

        {/* Formulaire d'ajout */}
        <View style={[styles.form, { backgroundColor: colors.card }] }>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
            placeholder="Nom du repas"
            placeholderTextColor={colors.placeholder}
            value={mealName}
            onChangeText={setMealName}
          /> 
          <Pressable
  onPress={handleResetValues}
  style={{ alignSelf: 'flex-start', marginVertical: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.card, borderRadius: 8 }}
>
  <Text style={{ fontSize: 13, color: colors.error }}>Réinitialiser</Text>
</Pressable>

          <View style={{ marginBottom: 15 }}>
  <Text style={{ marginBottom: 6, fontFamily: 'Inter_500Medium', color: colors.text }}>
    Quantité (en grammes)
  </Text>
  <TextInput
    style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
    placeholder="ex: 150"
    placeholderTextColor={colors.placeholder}
    value={mealQuantity}
    onChangeText={(text) => setMealQuantity(text)}
    keyboardType="numeric"
  />
  <Text style={{ fontSize: 13, marginTop: 4, color: colors.subtext }}>
    Les macros seront ajustées automatiquement
  </Text>
</View>


          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
            placeholder="Calories"
            placeholderTextColor={colors.placeholder}
            value={mealCalories}
            onChangeText={setMealCalories}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
            placeholder="Protéines"
            placeholderTextColor={colors.placeholder}
            value={mealProtein}
            onChangeText={setMealProtein}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
            placeholder="Glucides"
            placeholderTextColor={colors.placeholder}
            value={mealCarbs}
            onChangeText={setMealCarbs}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, borderColor: colors.inputBorder }]}
            placeholder="Lipides"
            placeholderTextColor={colors.placeholder}
            value={mealFat}
            onChangeText={setMealFat}
            keyboardType="numeric"
          />
          {/* Choix du type de repas */}
          <View style={styles.mealTypeContainer}>
            <Pressable
              style={[styles.mealTypeButton, { backgroundColor: colors.input }, mealType === 'breakfast' && { backgroundColor: colors.accent }]}
              onPress={() => setMealType('breakfast')}
            >
              <Text style={[styles.mealTypeText, { color: mealType === 'breakfast' ? colors.buttonText : colors.text }]}>Petit déjeuner</Text>
            </Pressable>
            <Pressable
              style={[styles.mealTypeButton, { backgroundColor: colors.input }, mealType === 'lunch' && { backgroundColor: colors.accent }]}
              onPress={() => setMealType('lunch')}
            >
              <Text style={[styles.mealTypeText, { color: mealType === 'lunch' ? colors.buttonText : colors.text }]}>Déjeuner</Text>
            </Pressable>
            <Pressable
              style={[styles.mealTypeButton, { backgroundColor: colors.input }, mealType === 'dinner' && { backgroundColor: colors.accent }]}
              onPress={() => setMealType('dinner')}
            >
              <Text style={[styles.mealTypeText, { color: mealType === 'dinner' ? colors.buttonText : colors.text }]}>Dîner</Text>
            </Pressable>
            <Pressable
              style={[styles.mealTypeButton, { backgroundColor: colors.input }, mealType === 'snack' && { backgroundColor: colors.accent }]}
              onPress={() => setMealType('snack')}
            >
              <Text style={[styles.mealTypeText, { color: mealType === 'snack' ? colors.buttonText : colors.text }]}>La Collation</Text>
            </Pressable>
          </View>
          <Pressable onPress={showDatePicker} style={[styles.datePickerButton, { backgroundColor: colors.input }] }>
            <Text style={[styles.datePickerText, { color: colors.text }]}>Date : {format(mealDate, 'dd/MM/yyyy')}</Text>
          </Pressable>
            <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
          
         

          <Pressable style={[styles.saveButton, { backgroundColor: colors.button }]} onPress={handleAddMeal}>
            <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>Enregistrer le repas</Text>
          </Pressable>
          {loading && <ActivityIndicator size="small" color={colors.accent} />}
          {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
        </View>

        {/* Historique des repas ajoutés */}
        <View style={[styles.section, { backgroundColor: colors.card }] }>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Historique des repas</Text>
          {history.map((meal) => (
            <View key={meal.id} style={styles.historyItem}>
              <Text style={[styles.historyName, { color: colors.text }]}>{meal.name}</Text>
              <View style={styles.macroRow}>
                <Text style={[styles.macroText, { color: colors.text }]}>⚡ {meal.calories} cal</Text>
                <Text style={[styles.macroText, { color: colors.text }]}>🥩 {meal.protein}g</Text>
                <Text style={[styles.macroText, { color: colors.text }]}>🍞 {meal.carbs}g</Text>
                <Text style={[styles.macroText, { color: colors.text }]}>🧈 {meal.fat}g</Text>
              </View>
              <Text style={[styles.historyDetails, { color: colors.subtext }]}>
                {meal.calories} cal - {meal.protein}g prot - {meal.carbs}g gluc - {meal.fat}g lip | {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)} - {format(new Date(meal.created_at), 'dd/MM/yyyy')}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
  <Pressable onPress={() => handleReuseMeal(meal)} style={{ backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
    <Text style={{ fontSize: 13, color: colors.accent }}>Réutiliser</Text>
  </Pressable>
</View>



            </View>
          ))}
          {history.length === 0 && <Text style={[styles.noHistory, { color: colors.subtext }]}>Aucun repas ajouté pour le moment.</Text>}
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
