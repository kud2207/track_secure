import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Changement ici
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#999',
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
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap; // Type correct

          switch (route.name) {
            case 'index':
              iconName = 'map-marker-radius';
              break;
            case 'settings':
              iconName = 'cog-outline'; // Icône valide de MaterialCommunityIcons
              break;
            case 'profile':
              iconName = 'account-circle-outline';
              break;
            default:
              iconName = 'circle-outline';
          }

          return (
            <MaterialCommunityIcons // Utilisation directe du composant
              name={iconName}
              size={focused ? 30 : 26}
              color={color}
              style={{
                transform: [{ translateY: focused ? -6 : 0 }],
              }}
            />
          );
        },
      })}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Setting',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Localisation',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}