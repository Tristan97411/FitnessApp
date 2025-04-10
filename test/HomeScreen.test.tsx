import { render, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index';
import { supabase } from '@/lib/supabase';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';


jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({
        data: [
          { calories: 500, carbs: 50, protein: 30, fat: 10 },
          { calories: 600, carbs: 70, protein: 40, fat: 20 },
        ],
      }),
    })),
  },
}));

describe('HomeScreen', () => {
  it('should display nutrition data correctly', async () => {
    render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    // Wait for data to be fetched and rendered
    await waitFor(() => screen.getByText('Calories Consommées'));

    // Vérifier que les valeurs totales sont affichées correctement
   // Attendre que les données nutritionnelles soient chargées
  await waitFor(() => expect(screen.getByText('0 cal')).toBeTruthy());
  
  
  });
});
