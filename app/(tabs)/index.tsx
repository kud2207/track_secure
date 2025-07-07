import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

export default function MapComponent() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [vehicule, setVehicule] = useState<any>(null);

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    // Charger les infos utilisateur et véhicule
    (async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      const parsed = stored ? JSON.parse(stored) : null;
      setUserInfo(parsed);

      if (parsed?.numero_tel) {
        // Récupérer le véhicule associé depuis Supabase
        const { data } = await supabase
          .from('vehicule')
          .select('*')
          .eq('proprietaire_vehicule_numero', parsed.numero_tel)
          .single();

        if (data) setVehicule(data);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission refusée');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current);

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc);
          mapRef.current?.animateToRegion(
            {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            500
          );
        }
      );
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
        <Text style={styles.loadingText}>Chargement de la position...</Text>
      </View>
    );
  }

  const currentPosition = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  return (
    <View style={styles.container}>
      {/* Info en haut */}
      <View style={styles.topInfo}>
        <View>
          <Text style={styles.name}>
            {userInfo?.nom || 'Nom'} {userInfo?.prenom || 'Prénom'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.matricule}>
            {vehicule?.immatriculation || 'No Vehicule'}
          </Text>
          <Text style={styles.couleur}>
            {vehicule?.couleur || ''}
          </Text>
        </View>
      </View>

      {/* Carte */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...currentPosition,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={currentPosition}
          title="Moi"
          description="Position actuelle"
          pinColor="blue"
        />
      </MapView>

      {/* Actions en bas */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="phone" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="volume-up" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  topInfo: {
    position: 'absolute',
    top: 40,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#00000080',
    padding: 5,
    borderRadius: 6,
  },
  matricule: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#00000080',
    padding: 4,
    borderRadius: 6,
  },
  couleur: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#00000080',
    padding: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  actionButton: {
    backgroundColor: '#ff9810',
    padding: 15,
    borderRadius: 70,
    elevation: 3,
  },
});
