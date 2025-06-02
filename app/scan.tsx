import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera'; // Import pour le composant
import { Camera } from 'expo-camera';           // Import pour les fonctions (permissions)

type BarcodeScanningResult = {
  type: string;
  data: string;
};

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await res.json();

      if (!json.product) {
        Alert.alert('Produit introuvable');
        router.back();
        return;
      }

      const product = json.product;
      const nutriments = product.nutriments;

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

  if (hasPermission === null) {
    return <Text>Demande de permission caméra...</Text>;
  }

  if (hasPermission === false) {
    return <Text>Permission caméra refusée</Text>;
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text>Scanner non disponible sur le web</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back" // <= 'back' en string ici
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
