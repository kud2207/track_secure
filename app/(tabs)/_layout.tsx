import React from 'react';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View, Text, StyleSheet, Alert, ToastAndroid, StatusBar } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { router } from "expo-router";
import { Avatar } from 'react-native-paper';

export default function TabLayout() {

  //Se deconnecter
  const signOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          onPress: () => {
            ToastAndroid.show(
              'Déconnexion annulée',
              ToastAndroid.SHORT
            );

          },
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: () => {
            ToastAndroid.show(
              '🔒 Déconnexion de TrackSecure',
              ToastAndroid.SHORT
            );

            router.push('/(auth)/login-in');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
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


          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => {
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
                style={{
                  transform: [{ translateY: focused ? -7 : 0 }],
                }}
              />
            );
          },
        };

        // Options spécifiques à chaque écran
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
              <MaterialIcons
                name="info-outline"
                size={28}
                color="#1c2833"
                style={{ marginRight: 15 }}
              />
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
          return {
            ...baseOptions,
            title: 'Profile',

            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Avatar.Text size={35} label="KU" labelStyle={{ color: 'white', fontWeight: 'bold' }}
                  style={{ backgroundColor: '#ff9810' }} />
                <Text style={[styles.headerText, { color: '', marginLeft: 10 }]}>kageu</Text>
                <Text style={[styles.headerText, { color: '', marginLeft: 0 }]}>ulrich</Text>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  signOut()
                }}
                style={{ marginRight: 15 }}
              >
                <MaterialIcons
                  name="logout"
                  size={28}
                  color="#e74c3c"
                />
              </TouchableOpacity>

            ),
          };
        }

        return baseOptions;
      }}
    >
       <StatusBar barStyle="light-content" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="profile" />
    </Tabs>
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
});