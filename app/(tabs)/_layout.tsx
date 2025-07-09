import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  Alert,
  ToastAndroid,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Avatar, Dialog, Portal, Button, Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from '@/utils/supabase';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { router } from "expo-router";

export default function TabLayout() {
  const [user, setUser] = useState<any>(null);
  const [vehicule, setVehicule] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('userInfo');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      }
    };
    fetchUser();
  }, []);

  const fetchVehicule = async () => {
    if (!user?.numero_tel) return;

    const { data, error } = await supabase
      .from('vehicule')
      .select('*')
      .eq('proprietaire_vehicule_numero', user.numero_tel)
      .single();

    if (error) {
      console.log('Erreur récupération véhicule:', error.message);
    } else {
      setVehicule(data);
    }
  };

  const openDialog = async () => {
    await fetchVehicule();
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const signOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          onPress: () => ToastAndroid.show('Déconnexion annulée', ToastAndroid.SHORT),
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: async () => {
            ToastAndroid.show('Déconnexion de TrackSecure', ToastAndroid.SHORT);
            router.push('/(auth)/login-in');
            await AsyncStorage.removeItem('userInfo');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <PaperProvider>
      <Tabs
        screenOptions={({ route }): BottomTabNavigationOptions => {
          const baseOptions: BottomTabNavigationOptions = {
            tabBarActiveTintColor: '#ff9810',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#ccc',
              height: 80
            },
            tabBarInactiveTintColor: '#1c2833',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 2,
            },
            tabBarIconStyle: {
              marginTop: 0,
              alignSelf: 'center',
            },
            tabBarItemStyle: {
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 6,
            },
            tabBarStyle: {
              height: 60,
              paddingBottom: Platform.OS === 'android' ? 6 : 10,
              borderTopWidth: 1,
              backgroundColor: '#fff',
              shadowColor: 'transparent',
              shadowOpacity: 0,
            },
            tabBarIcon: ({ color, focused }) => {
              let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

              switch (route.name) {
                case 'index':
                  iconName = 'map-marker-radius';
                  break;
                case 'settings':
                  iconName = 'cog-outline';
                  break;
                case 'profile':
                  iconName = 'account-circle-outline';
                  break;
                default:
                  iconName = 'circle-outline';
              }

              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={focused ? 30 : 24}
                  color={color}
                  style={{ transform: [{ translateY: focused ? -7 : 0 }] }}
                />
              );
            },
          };

          if (route.name === 'index') {
            return {
              ...baseOptions,
              headerTitle: () => (
                <View style={styles.headerContainer}>
                  <Text style={[styles.headerText, { color: '#3498db' }]}>Track</Text>
                  <Text style={[styles.headerText, { color: '#ff9810' }]}>Secure</Text>
                  <Avatar.Image size={45} source={require('../../assets/images/icon.png')} />
                </View>
              ),
              headerRight: () => (
                <TouchableOpacity onPress={openDialog} style={{ marginRight: 15 }}>
                  <MaterialIcons name="info-outline" size={28} color="#1c2833" />
                </TouchableOpacity>
              ),
            };
          } else if (route.name === 'settings') {
            return {
              ...baseOptions,
              title: 'Réglages',
              headerRight: () => (
                <MaterialCommunityIcons
                  name="car-wrench"
                  size={28}
                  color="#1c2833"
                  style={{ marginRight: 15 }}
                />
              ),
            };
          } else if (route.name === 'profile') {
            const initiales = user
              ? `${user.prenom?.charAt(0) ?? ''}${user.nom?.charAt(0) ?? ''}`.toUpperCase()
              : '👤';

            return {
              ...baseOptions,
              title: 'Profil',
              headerTitle: () => (
                <View style={styles.headerContainer}>
                  <Avatar.Text
                    size={35}
                    label={initiales}
                    labelStyle={{ color: 'white', fontWeight: 'bold' }}
                    style={{ backgroundColor: '#ff9810' }}
                  />
                  <Text style={[styles.headerText, { marginLeft: 10 }]}>{user?.nom ?? ''}</Text>
                  <Text style={[styles.headerText]}>{user?.prenom ?? ''}</Text>
                </View>
              ),
              headerRight: () => (
                <TouchableOpacity onPress={signOut} style={{ marginRight: 15 }}>
                  <MaterialIcons name="logout" size={28} color="#e74c3c" />
                </TouchableOpacity>
              ),
            };
          }

          return baseOptions;
        }}
      >
        <StatusBar barStyle="light-content" />
        <Tabs.Screen name="settings" options={{ title: 'Réglages' }} />
        <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
        <Tabs.Screen name="profile" />
      </Tabs>

      {/* 💬 Dialog Infos Utilisateur */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Informations utilisateur</Dialog.Title>
          <Dialog.Content>
            <Text>👤 {user?.prenom} {user?.nom}</Text>
            <Text>📧 {user?.email ?? 'Email non défini'}</Text>
            <View style={styles.divider} />
            <Text>🚗 Matricule : {vehicule?.immatriculation ?? 'N/A'}</Text>
            <Text>Marque : {vehicule?.marque ?? 'N/A'}</Text>
            <Text>Couleur : {vehicule?.couleur ?? 'N/A'}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Fermer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});
