import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        setIsAuthenticated(true);
      }
      setChecking(false);
    };
    checkUser();
  }, []);

  if (checking) return null; // ⏳ Affiche rien pendant le check (tu peux mettre un loader ici)

  // ✅ Redirection selon auth
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}
