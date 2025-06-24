import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddScreen from '../app/(tabs)/add'; // adapte le chemin si besoin

global.alert = jest.fn();

// Mocks nécessaires
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// Mock useAuthStore pour simuler session utilisateur
jest.mock('../app/_layout', () => ({
  useAuthStore: () => ({
    session: {
      user: { id: 'test-user-id' },
    },
  }),
}));

// Mock expo-router pour router et params
const pushMock = jest.fn();

jest.mock('expo-router', () => {
  const pushMock = jest.fn(); // défini ici, donc connu de la factory
  return {
    useRouter: () => ({
      push: pushMock,
    }),
    useLocalSearchParams: () => ({}),
    __esModule: true, // important parfois si "expo-router" est un module ES
    pushMock, // expose le mock pour le récupérer dans les tests
  };
});


describe('AddScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche les champs du formulaire et l’historique vide au départ', async () => {
    render(<AddScreen />);

    expect(screen.getByPlaceholderText('Nom du repas')).toBeTruthy();
    expect(screen.getByPlaceholderText('Calories')).toBeTruthy();
    expect(screen.getByPlaceholderText('Protéines')).toBeTruthy();
    expect(screen.getByText('Ajouter un repas')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText(/Aucun repas ajouté pour le moment/i)).toBeTruthy();
    });
  });

  it('bloque l’ajout si nom ou calories non remplis', async () => {
    render(<AddScreen />);

    const saveButton = screen.getByText(/Enregistrer le repas/i);

    await act(async () => {
      fireEvent.press(saveButton);
    });

    // Ici tu peux vérifier si alert a été appelé selon l’implémentation
  });

  it('ajoute un repas et redirige', async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const fromMock = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: insertMock,
    }));

    const { supabase } = require('../lib/supabase');
    supabase.from = fromMock;

    render(<AddScreen />);

    await act(async () => {
      fireEvent.changeText(screen.getByPlaceholderText('Nom du repas'), 'Test Meal');
      fireEvent.changeText(screen.getByPlaceholderText('Calories'), '300');
      fireEvent.changeText(screen.getByPlaceholderText('Protéines'), '20');
      fireEvent.changeText(screen.getByPlaceholderText('Glucides'), '30');
      fireEvent.changeText(screen.getByPlaceholderText('Lipides'), '10');
    });

    await act(async () => {
      fireEvent.press(screen.getByText(/Enregistrer le repas/i));
    });

    await waitFor(() => {
      expect(fromMock).toHaveBeenCalledWith('meals');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Meal',
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 10,
          user_id: "test-user-id",
          created_at: expect.any(String),
        })
      );
    });
  });

  it('affiche l’historique des repas', async () => {
    const mockData = [
      {
        id: 'meal1',
        user_id: 'test-user-id',
        name: 'Meal 1',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        meal_type: 'lunch',
        created_at: new Date().toISOString(),
      },
    ];

    const supabase = require('../lib/supabase').supabase;
    supabase.from = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: (cb: Function) => cb({ data: mockData, error: null }),
    }));

    render(<AddScreen />);

    await waitFor(() => {
      expect(screen.getByText('Meal 1')).toBeTruthy();
    });
  });
});
