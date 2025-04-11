import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router'; // Assure-toi d'importer useRouter correctement

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const router = useRouter(); // Initialiser le router ici

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await res.json();

      if (!json.product) {
        Alert.alert('Produit introuvable');
        router.back(); // Naviguer en arrière si produit introuvable
        return;
      }

      const product = json.product;
      const nutriments = product.nutriments;

      // Utilisation de router.push pour envoyer les paramètres via 'params'
      router.push({
        pathname: '/add',
        params: {
          name: product.product_name,
          calories: nutriments['energy-kcal_100g']?.toString() || '',
          protein: nutriments.proteins_100g?.toString() || '',
          carbs: nutriments.carbohydrates_100g?.toString() || '',
          fat: nutriments.fat_100g?.toString() || '',
        },
      });
    } catch (error) {
      console.error('Erreur API:', error);
      Alert.alert('Erreur lors de la récupération des données');
      router.back();
    }
  };

  if (!hasPermission) {
    return <Text>Demande de permission caméra...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
      />
    </View>
  );
}
