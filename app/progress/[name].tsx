import { View, Text, StyleSheet, Dimensions, ScrollView, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [dataPoints, setDataPoints] = useState<{ date: string, weight: number, repetitions: number }[]>([]);
  const router = useRouter();

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
        date: new Date(entry.created_at).toLocaleDateString(),
        weight: entry.weight || 0,
        repetitions: entry.repetitions || 0,

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
      <View style={styles.container}>
        <Text style={styles.title}>Aucune donnée trouvée pour "{name}"</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Progression pour "{name}"</Text>
      <LineChart
  data={{
    labels: dataPoints.map((point) => point.date),
    datasets: [
      { data: dataPoints.map((point) => point.weight), color: () => 'rgba(0, 122, 255, 1)', strokeWidth: 2 },
      { data: dataPoints.map((point) => point.repetitions), color: () => 'rgba(255, 99, 132, 1)', strokeWidth: 2 },
    ],
    legend: ['Poids (kg)', 'Répétitions'],
  }}
  width={screenWidth - 40}
  height={240}
  yAxisSuffix=""
  chartConfig={{
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#f5f5f5',
    backgroundGradientTo: '#f5f5f5',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  }}
  style={styles.chart}
/>
<Button title="Retour" onPress={() => router.back()}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  chart: { marginVertical: 8, borderRadius: 16 },
});
