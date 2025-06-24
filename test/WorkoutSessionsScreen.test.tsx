import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import WorkoutSessionsScreen from '../app/(tabs)/workout'; // ajuste le chemin si nécessaire
import { supabase } from '../lib/supabase';

// 💡 Mock navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

// 💡 Mock du composant modal de création
jest.mock('../app/components/WorkoutSessionForm', () => ({
  WorkoutSessionForm: ({ visible, onClose, onSubmit }: any) => (
    visible ? <></> : null
  ),
}));

// 💡 Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'mock-user-id' } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Séance Mock',
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      }),
    })),
  },
}));

describe('WorkoutSessionsScreen', () => {
  it('affiche le bouton Nouvelle Séance', async () => {
    render(
      <NavigationContainer>
        <WorkoutSessionsScreen />
      </NavigationContainer>
    );

    expect(await screen.findByText('🎮 Nouvelle Séance')).toBeTruthy();
  });

  it('affiche une séance mockée depuis Supabase', async () => {
    render(
      <NavigationContainer>
        <WorkoutSessionsScreen />
      </NavigationContainer>
    );

    expect(await screen.findByText(/Séance Mock/i)).toBeTruthy();
  });

  it('affiche les boutons Voir et Exercices', async () => {
    render(
      <NavigationContainer>
        <WorkoutSessionsScreen />
      </NavigationContainer>
    );

    expect(await screen.findByText('📋 Voir')).toBeTruthy();
    expect(await screen.findByText('➕ Exercices')).toBeTruthy();
  });

  it('affiche les boutons de pagination', async () => {
    render(
      <NavigationContainer>
        <WorkoutSessionsScreen />
      </NavigationContainer>
    );

    expect(await screen.findByText('⬅️')).toBeTruthy();
    expect(await screen.findByText('➡️')).toBeTruthy();
    expect(await screen.findByText(/Page/i)).toBeTruthy();
  });
});
