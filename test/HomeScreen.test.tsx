// Importations nécessaires
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index'; // Met à jour le chemin si nécessaire
import { supabase } from '@/lib/supabase'; // Assurez-vous que cela pointe vers votre fichier supabase.ts

// Moquer supabase.auth.getUser et la méthode from()
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(), // Moque la fonction getUser
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [
          { calories: 500, protein: 30, carbs: 40, fat: 20 },
          { calories: 300, protein: 20, carbs: 30, fat: 10 },
        ],
        error: null,
      }),
      eq: jest.fn().mockReturnThis(), // Moque la méthode eq()
    }),
  },
}));

describe('HomeScreen', () => {
  it('affiche les données nutritionnelles correctement après récupération', async () => {
    // Moquer le retour de supabase.auth.getUser pour qu'il retourne une promesse résolue
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    // Rendu du composant HomeScreen
    render(<HomeScreen />);

    // Attendre l'affichage du texte "Calories Consommées"
    await waitFor(() => screen.getByText('Calories Consommées'));

    // Vérifications des valeurs affichées
    expect(screen.getByText('800 cal')).toBeTruthy(); // Total calories attendu
    expect(screen.getByText('70 g')).toBeTruthy();  // Total carbs
    expect(screen.getByText('50 g')).toBeTruthy();  // Total proteins
    expect(screen.getByText('30 g')).toBeTruthy();  // Total fat
  });
});
