import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';
import { getColors } from '../../lib/theme-colors';
import { ChevronLeft } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [dataPoints, setDataPoints] = useState<{ date: string; weight: number; repetitions: number }[]>([]);
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const average = (arr: number[]) =>
    Array.isArray(arr) && arr.length > 0
      ? arr.reduce((sum, val) => sum + Number(val), 0) / arr.length
      : 0;

  const fetchProgressData = async () => {
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('created_at, weight, repetitions')
      .eq('name', name)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur de chargement des données de progression:', error);
      return;
    }

    if (data) {
      const points = data.map((entry) => ({
        date: new Date(entry.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        weight: average(entry.weight),
        repetitions: average(entry.repetitions),
      }));
      setDataPoints(points);
    }
  };

  useEffect(() => {
    if (name) {
      fetchProgressData();
    }
  }, [name]);

  if (dataPoints.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Aucune donnée trouvée pour "{name}"</Text>
        <Pressable
          style={[styles.backButton, { backgroundColor: colors.button }]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={18} color={colors.buttonText} />
          <Text style={[styles.backButtonText, { color: colors.buttonText }]}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const avgWeight = average(dataPoints.map(p => p.weight)).toFixed(1);
  const avgReps = average(dataPoints.map(p => p.repetitions)).toFixed(1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Progression pour "{name}"</Text>

    

      <Text style={[styles.graphTitle, { color: colors.text }]}>Progression du poids (kg)</Text>
<LineChart
  data={{
    labels: dataPoints.map((point) => point.date),
    datasets: [
      {
        data: dataPoints.map((point) => point.weight),
        color: () => colors.accent,
        strokeWidth: 2,
      },
    ],
    legend: ['Poids (kg)'],
  }}
  width={screenWidth - 40}
  height={260}
  chartConfig={{
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `${colors.accent}${Math.floor(opacity * 255).toString(16)}`,
    labelColor: (opacity = 1) => `${colors.subtext}${Math.floor(opacity * 255).toString(16)}`,
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: colors.text,
    },
  }}
  bezier
  style={styles.chart}
/>

<Text style={[styles.graphTitle, { color: colors.text }]}>Progression des répétitions</Text>
<LineChart
  data={{
    labels: dataPoints.map((point) => point.date),
    datasets: [
      {
        data: dataPoints.map((point) => point.repetitions),
        color: () => colors.warning || '#FFA500',
        strokeWidth: 2,
      },
    ],
    legend: ['Répétitions'],
  }}
  width={screenWidth - 40}
  height={260}
  chartConfig={{
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `${colors.warning || '#FFA500'}${Math.floor(opacity * 255).toString(16)}`,
    labelColor: (opacity = 1) => `${colors.subtext}${Math.floor(opacity * 255).toString(16)}`,
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: colors.text,
    },
  }}
  bezier
  style={styles.chart}
/>


      <Pressable
        style={[styles.backButton, { backgroundColor: colors.button }]}
        onPress={() => router.back()}
      >
        <ChevronLeft size={18} color={colors.buttonText} />
        <Text style={[styles.backButtonText, { color: colors.buttonText }]}>Retour</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 20,
    marginTop: 20,
  },
  summary: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Inter_500Medium',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    marginLeft: 6,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  graphTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  
});
