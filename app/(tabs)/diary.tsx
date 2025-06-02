import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';  // Installer ce package si nécessaire
import { startOfDay, endOfDay } from 'date-fns';

type Meal = {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  meal_type: string;
  date?: string;
  created_at: string;
};



export default function DiaryScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());  // Date initiale (aujourd'hui)
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);  // Repas filtrés
  const [showDatePicker, setShowDatePicker] = useState(false);  // Affichage du sélecteur de date

  // Récupérer les repas depuis Supabase
  useFocusEffect(
    useCallback(() => {
      const fetchMeals = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          if (!user) throw new Error("Aucun utilisateur connecté.");
          
          const { data, error: mealsError } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (mealsError) throw mealsError;

          setMeals(data || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
          setLoading(false);
        }
      };

      fetchMeals();
    }, [])
  );

  const filterMealsByDate = (date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
  
    const filtered = meals.filter(meal => {
      const mealDate = new Date(meal.created_at);
      return mealDate >= start && mealDate <= end;
    });
  
    setFilteredMeals(filtered);
  };
  

  useEffect(() => {
    filterMealsByDate(selectedDate);
  }, [selectedDate, meals]);

  // Calcul des calories totales de la journée
  const totalCaloriesToday = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0);

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const groupedMeals = mealTypes.reduce((acc, type) => {
    acc[type] = filteredMeals.filter(meal => meal.meal_type.toLowerCase() === type);
    return acc;
  }, {} as { [key: string]: Meal[] });

  // Fonction pour afficher le DatePicker
  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
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
          <Text style={styles.headerTitle}>Food Diary</Text>
        </View>

        {/* Affichage de la date sélectionnée */}
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>{format(selectedDate, 'dd/MM/yyyy')}</Text>
        </Pressable>

        {/* Affichage du sélecteur de date */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            onChange={handleDateChange}
          />
        )}

        {/* Total des calories du jour */}
        <View style={styles.totalCaloriesContainer}>
          <Text style={styles.totalCaloriesText}>Total du jour : {totalCaloriesToday} cal</Text>
        </View>

        {mealTypes.map((type) => {
          const items = groupedMeals[type] || [];
          if (items.length === 0) return null;

          const totalCalories = items.reduce((sum, meal) => sum + meal.calories, 0);
          return (
            <MealSection
              key={type}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
              calories={totalCalories}
              items={items.map(meal => ({
                name: meal.name,
                calories: meal.calories,
                amount: meal.name 
              }))} 
            />
          );
        })}

        <Pressable style={styles.addButton} onPress={() => router.push('/add')}>
          <Text style={styles.addButtonText}>Add Food</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// Section pour afficher chaque type de repas
function MealSection({
  title,
  calories,
  items,
}: {
  title: string;
  calories: number;
  items: Array<{ name: string; calories: number; amount: string }>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCalories}>{calories} cal</Text>
      </View>

      {items.map((item, index) => (
        <Pressable key={index} style={styles.foodItem} onPress={() => {}}>
          <View>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodAmount}>{item.amount}</Text>
          </View>
          <View style={styles.foodItemRight}>
            <Text style={styles.foodCalories}>{item.calories} cal</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </View>
        </Pressable>
      ))}
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
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#1C1C1E',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1C1C1E',
  },
  sectionCalories: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#8E8E93',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  foodName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  foodAmount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8E8E93',
  },
  foodItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foodCalories: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#8E8E93',
  },
  addButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  error: {
    fontFamily: 'Inter_400Regular',
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
  totalCaloriesContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  totalCaloriesText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#1C1C1E',
  },
  dateButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  
});
