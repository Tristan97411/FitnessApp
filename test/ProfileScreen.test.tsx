import { render, screen, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../app/(tabs)/profile'; // Assure-toi que le chemin est correct
import { supabase } from '@/lib/supabase'; // Supposons que c'est là que tu importes supabase

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({
      data: { username: 'JohnDoe', current_weight: 180, daily_calorie_goal: 2500 },
      error: null,
    }),
  },
}));

describe('ProfileScreen', () => {
  it('should display loading indicator when fetching profile', () => {
    render(<ProfileScreen />);
    
    expect(screen.getByTestId('loading')).toBeTruthy(); // Si tu as un indicateur de chargement avec un testID
  });

  it('should display user profile information when fetched', async () => {
    render(<ProfileScreen />);

    await waitFor(() => expect(screen.getByText('JohnDoe')).toBeTruthy()); // Vérifie le nom d'utilisateur
    expect(screen.getByText('Current Weight: 180 lbs')).toBeTruthy();
    expect(screen.getByText('Daily Calorie Goal: 2500')).toBeTruthy();
  });

  it('should display error message if profile fetch fails', async () => {
    jest.mock('@/lib/supabase', () => ({
      supabase: {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '123' } },
            error: null,
          }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(new Error('Failed to fetch profile')),
      },
    }));

    render(<ProfileScreen />);

    await waitFor(() => expect(screen.getByText('Une erreur est survenue')).toBeTruthy()); // Message d'erreur
  });
});
