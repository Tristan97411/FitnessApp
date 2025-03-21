import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Timer, Flame } from 'lucide-react-native';

export default function ExerciseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Exercise</Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>320</Text>
            <Text style={styles.summaryLabel}>Calories Burned</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>45</Text>
            <Text style={styles.summaryLabel}>Minutes Active</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>3/5</Text>
            <Text style={styles.summaryLabel}>Workouts</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <WorkoutItem
            name="Morning Run"
            duration="30 min"
            calories={250}
            image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60"
          />
          <WorkoutItem
            name="Strength Training"
            duration="45 min"
            calories={320}
            image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60"
          />
          <WorkoutItem
            name="Yoga"
            duration="60 min"
            calories={180}
            image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Workouts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedWorkouts}>
            <SuggestedWorkout
              name="HIIT Cardio"
              duration="20 min"
              level="Intermediate"
              image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60"
            />
            <SuggestedWorkout
              name="Full Body"
              duration="45 min"
              level="Beginner"
              image="https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800&auto=format&fit=crop&q=60"
            />
            <SuggestedWorkout
              name="Core Strength"
              duration="30 min"
              level="Advanced"
              image="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=60"
            />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkoutItem({ name, duration, calories, image }: { 
  name: string; 
  duration: string; 
  calories: number;
  image: string;
}) {
  return (
    <Pressable style={styles.workoutItem}>
      <Image source={{ uri: image }} style={styles.workoutImage} />
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{name}</Text>
        <View style={styles.workoutStats}>
          <View style={styles.workoutStat}>
            <Timer size={16} color="#8E8E93" />
            <Text style={styles.workoutStatText}>{duration}</Text>
          </View>
          <View style={styles.workoutStat}>
            <Flame size={16} color="#8E8E93" />
            <Text style={styles.workoutStatText}>{calories} cal</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#8E8E93" />
    </Pressable>
  );
}

function SuggestedWorkout({ name, duration, level, image }: {
  name: string;
  duration: string;
  level: string;
  image: string;
}) {
  return (
    <Pressable style={styles.suggestedWorkout}>
      <Image source={{ uri: image }} style={styles.suggestedWorkoutImage} />
      <View style={styles.suggestedWorkoutInfo}>
        <Text style={styles.suggestedWorkoutName}>{name}</Text>
        <Text style={styles.suggestedWorkoutDetails}>{duration} • {level}</Text>
      </View>
    </Pressable>
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
  summary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
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
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  workoutImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 15,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8E8E93',
  },
  suggestedWorkouts: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  suggestedWorkout: {
    width: 200,
    marginRight: 15,
  },
  suggestedWorkoutImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestedWorkoutInfo: {
    paddingHorizontal: 4,
  },
  suggestedWorkoutName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  suggestedWorkoutDetails: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8E8E93',
  },
});