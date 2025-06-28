import React from 'react';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View, Text, StyleSheet } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

export default function TabLayout() {
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
            borderBottomWidth: 0.5,
            borderBottomColor: '#ccc',
          },
          tabBarInactiveTintColor: '#1c2833',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === 'ios' ? -3 : -6,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 6,
          },
          tabBarStyle: {
            height: 70,
            paddingBottom: 10,
            borderTopWidth: 0.3,
            borderTopColor: '#ccc',
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
                size={focused ? 40 : 26}
                color={color}
                style={{
                  transform: [{ translateY: focused ? -10 : 0 }],
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
              </View>
            ),
            headerRight: () => (
              <MaterialIcons
                name="info-outline"
                size={24}
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
                size={24}
                color="#1c2833"
                style={{ marginRight: 15 }}
              />
            ),
          };
        } else if (route.name === 'profile') {
          return {
            ...baseOptions,
            title: 'Profil',  
            headerRight: () => (
              <MaterialCommunityIcons
                name="account-lock-open-outline"
                size={24}
                color="#1c2833"
                style={{ marginRight: 15 }}
              />
            ),
          };
        }

        return baseOptions;
      }}
    >
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="index"   options={{ title: 'Accueil' }} />
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