import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import DiaryScreen from '../app/(tabs)/diary';
import { NavigationContainer } from '@react-navigation/native';

// Mock Supabase
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
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((cb) =>
        Promise.resolve(
          cb({
            data: [
              {
                id: 'meal-1',
                user_id: 'test-user-id',
                name: 'Omelette',
                calories: 300,
                protein: 20,
                carbs: 5,
                fat: 15,
                meal_type: 'breakfast',
                created_at: new Date().toISOString(),
              },
              {
                id: 'meal-2',
                user_id: 'test-user-id',
                name: 'Salade',
                calories: 100,
                protein: 5,
                carbs: 10,
                fat: 2,
                meal_type: 'lunch',
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          })
        )
      ),
    })),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('DiaryScreen', () => {
  it('affiche les repas filtrés par date et le total des calories', async () => {
    render(
      <NavigationContainer>
        <DiaryScreen />
      </NavigationContainer>
    );

    // Attendre que le titre "Food Diary" soit visible (fin du chargement)
    await waitFor(() => {
      expect(screen.getByText('Food Diary')).toBeTruthy();
    });

    // Vérifier les noms des repas
expect(screen.getAllByText('Omelette').length).toBeGreaterThan(0);
expect(screen.getAllByText('Salade').length).toBeGreaterThan(0);

    // Vérifier le total des calories (300 + 100 = 400)
    expect(screen.getByText(/Total du jour : 400 cal/i)).toBeTruthy();

    // Vérifier que les sections repas apparaissent avec les bons titres
    expect(screen.getByText('Breakfast')).toBeTruthy();
    expect(screen.getByText('Lunch')).toBeTruthy();

    // Les sections non présentes ne doivent pas être dans le rendu
    expect(screen.queryByText('Dinner')).toBeNull();
    expect(screen.queryByText('Snack')).toBeNull();
  });
});
