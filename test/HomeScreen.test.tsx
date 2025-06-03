import { render, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import React from 'react';

jest.setTimeout(10000); // 10 secondes

// 💡 Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((cb) =>
        Promise.resolve(
          cb({
            data: [
              {
                calories: 500,
                carbs: 50,
                protein: 25,
                fat: 10,
              },
              {
                calories: 300,
                carbs: 30,
                protein: 10,
                fat: 5,
              },
            ],
            error: null,
          })
        )
      ),
    })),
  },
}));

describe('HomeScreen', () => {
  it('affiche correctement les données nutritionnelles', async () => {
    render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    // Attend que "Calories Consommées" soit visible
    expect(await screen.findByText(/Calories Consommées/i)).toBeTruthy();

    // Calories totales attendues : 500 + 300 = 800
    expect(await screen.findByText('800 cal')).toBeTruthy();

    // Détails nutritionnels
    expect(await screen.findByText('800')).toBeTruthy(); // TotalCalories
    expect(await screen.findByText('80 g')).toBeTruthy(); // Carbs
    expect(await screen.findByText('35 g')).toBeTruthy(); // Protein
    expect(await screen.findByText('15 g')).toBeTruthy(); // Fat
  });
});
