import { Redirect, Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');

      // Attendre 4 secondes avant de continuer
      setTimeout(() => {
        setIsAuthenticated(!!token);
      }, 4000);
    };
    checkAuth();
  }, []);

  return (
    <PaperProvider>
      {isAuthenticated === null ? (
        <View style={styles.container}>
          <Image
            source={require('../assets/images/laodingTrackSecure.gif')}
            style={styles.loadingGif}
            resizeMode="contain"
          />
        </View>
      ) : !isAuthenticated ? (
        <Redirect href="/(auth)/login-in" />
      ) : (
        <Slot />
      )}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: 300,
    height: 300,
  },
});
