import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import "expo-router/entry";

export default function HomeScreen() {
  const today = format(new Date(), 'EEEE, MMMM d');
  const [nutritionData, setNutritionData] = useState({
    totalCalories: 0,
    totalCarbs: 0,
    totalProtein: 0,
    totalFat: 0,
  });

  const [user, setUser] = useState<any>(null);  // Ajouté pour suivre l'état de l'utilisateur
  const [loading, setLoading] = useState(true); // Pour gérer l'état de chargement

  // Vérification de l'utilisateur au lancement
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        // Redirige vers la page de connexion ou affiche un message
        return;
      }
      setUser(user);  // Mettre l'utilisateur dans l'état
      setLoading(false);  // Marquer comme terminé une fois l'utilisateur récupéré
    };

    checkUser();
  }, []);

  // Récupérer les repas et calculer les totaux une fois l'utilisateur connecté
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        return; // Si l'utilisateur n'est pas encore connecté, on ne charge rien
      }

      const fetchMealsData = async () => {
        try {
          const start = startOfDay(new Date()).toISOString();
          const end = endOfDay(new Date()).toISOString();

          const { data, error: mealsError } = await supabase
            .from('meals')
            .select('calories, protein, carbs, fat, created_at')
            .eq('user_id', user.id)
            .gte('created_at', start)
            .lte('created_at', end);

          if (mealsError) {
            console.error('Erreur dans la récupération des repas:', mealsError);
            return;
          }

    

          // Calcul des totaux
          const totals = data.reduce(
            (acc, meal) => {
              acc.totalCalories += meal.calories || 0;
              acc.totalCarbs += meal.carbs || 0;
              acc.totalProtein += meal.protein || 0;
              acc.totalFat += meal.fat || 0;
              return acc;
            },
            { totalCalories: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0 }
          );

          setNutritionData(totals);
        } catch (err) {
          console.error('Erreur lors de la récupération des repas', err);
        }
      };

      fetchMealsData();
    }, [user]) // Recharger les repas lorsque l'utilisateur est défini
  );

  const { totalCalories, totalCarbs, totalProtein, totalFat } = nutritionData;

  if (loading) {
    return <Text>Chargement...</Text>; // Affiche un message ou un loader pendant la récupération des données
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.date}>{today}</Text>
          <Text style={styles.title}>Calories Consommées</Text>
          <Text style={styles.calories}>{totalCalories} cal</Text>
          <View style={styles.calorieBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{totalCalories}</Text>
              <Text style={styles.breakdownLabel}>Calories</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{totalCarbs} g</Text>
              <Text style={styles.breakdownLabel}>Glucides</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{totalProtein} g</Text>
              <Text style={styles.breakdownLabel}>Protéines</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{totalFat} g</Text>
              <Text style={styles.breakdownLabel}>Lipides</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectifs Nutritionnels</Text>
          <View style={styles.nutritionGoals}>
            <NutritionGoal label="Glucides" current={totalCarbs} goal={250} unit="g" />
            <NutritionGoal label="Protéines" current={totalProtein} goal={150} unit="g" />
            <NutritionGoal label="Lipides" current={totalFat} goal={65} unit="g" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NutritionGoal({ label, current, goal, unit }: { label: string; current: number; goal: number; unit: string }) {
  const percentage = (current / goal) * 100;

  return (
    <View style={styles.nutritionGoal}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.nutritionValues}>
        {current}/{goal}{unit}
      </Text>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#1C1C1E',
    marginBottom: 5,
  },
  calories: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    color: '#007AFF',
    marginBottom: 20,
  },
  calorieBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  breakdownValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1C1C1E',
  },
  breakdownLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1C1C1E',
    marginBottom: 15,
  },
  nutritionGoals: {
    gap: 15,
  },
  nutritionGoal: {
    marginBottom: 10,
  },
  nutritionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  nutritionValues: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
  },
});
