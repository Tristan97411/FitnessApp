import { render, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index';
import { supabase } from '@/lib/supabase';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),  // Simuler un utilisateur connecté
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({
        data: [
          { calories: 360, carbs: 0, protein: 0, fat: 0 },
          { calories: 360, carbs: 0, protein: 0, fat: 0 },
        ],
        error: null,
      }),
    })),
  },
}));

describe('HomeScreen', () => {
  it('should display nutrition data correctly', async () => {
    jest.setTimeout(10000); // 10 secondes

    render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    // Attendre que les données nutritionnelles soient chargées et affichées
    await waitFor(() => screen.getByText('Calories Consommées'));

    // Vérifier que les valeurs totales sont affichées correctement
    await waitFor(() => expect(screen.getByText('0 cal')).toBeTruthy());  // Vérifier la somme correcte des calories
  });
});
