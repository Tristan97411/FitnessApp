// types/navigation.ts
export type RootTabParamList = {
    Exercise: undefined;
    WorkoutDetail: { group: any }; // groupe de travail avec des exercices
  };
  // types/navigation.d.ts (ou dans un autre fichier centralisé)
export type RootStackParamList = {
  WorkoutSessions: undefined;  // Pas de paramètres pour cette page
  AddExercise: { workoutId: string };  // Paramètre workoutId de type string pour la page AddExercise
};
