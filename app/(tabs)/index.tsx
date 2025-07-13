import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
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
  const [isBuzzerOn, setIsBuzzerOn] = useState(false);
  const [espIp, setEspIp] = useState<string | null>(null);

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      const parsed = stored ? JSON.parse(stored) : null;
      setUserInfo(parsed);

      if (parsed?.numero_tel) {
        const { data } = await supabase
          .from('vehicule')
          .select('*')
          .eq('proprietaire_vehicule_numero', parsed.numero_tel)
          .single();
        if (data) setVehicule(data);
      }

      const ip = await AsyncStorage.getItem('esp32_ip');
      if (ip) setEspIp(ip);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

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

  const toggleBuzzer = async () => {
    const action = isBuzzerOn ? 'off' : 'on';
    if (!espIp) {
      Alert.alert("Erreur", "Aucune adresse IP ESP32 configurée.");
      return;
    }
    const url = espIp.startsWith('http') ? `${espIp}/${action}` : `http://${espIp}/${action}`;

    try {
      const response = await fetch(url);
      const text = await response.text();
      console.log(text);
      setIsBuzzerOn(!isBuzzerOn);
    } catch (error) {
      Alert.alert('Erreur', 'Connexion à l’ESP32 impossible. Vérifie le Wi-Fi et l’IP.');
    }
  };

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
      {/* Info utilisateur */}
      <View style={styles.topInfo}>
        <Text style={styles.name}>
          {userInfo?.nom || 'Nom'} {userInfo?.prenom || 'Prénom'}
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.matricule}>{vehicule?.immatriculation || 'No Vehicule'}</Text>
          <Text style={styles.couleur}>{vehicule?.couleur || ''}</Text>
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

      {/* Boutons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="phone" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isBuzzerOn ? '#c62828' : '#4caf50' },
          ]}
          onPress={toggleBuzzer}
        >
          <FontAwesome
            name={isBuzzerOn ? 'volume-up' : 'volume-off'}
            size={24}
            color="white"
          />
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
