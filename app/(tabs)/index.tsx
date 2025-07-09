// MapComponent.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
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
  const [inputIp, setInputIp] = useState<string>('http://192.168.137.200');

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
      if (ip) {
        setEspIp(ip);
        setInputIp(ip);
      }
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

  const saveIp = async () => {
    if (!inputIp.trim()) {
      Alert.alert("Erreur", "L'adresse IP ne peut pas être vide.");
      return;
    }
    await AsyncStorage.setItem('esp32_ip', inputIp.trim());
    setEspIp(inputIp.trim());
    Alert.alert('Succès', 'IP ESP32 sauvegardée');
  };

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
      {/* Saisie IP */}
      <View style={styles.ipInputContainer}>
        <TextInput
          style={styles.ipInput}
          placeholder="IP ESP32 (ex: http://192.168.137.200)"
          value={inputIp}
          onChangeText={setInputIp}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity style={styles.saveIpButton} onPress={saveIp}>
          <Text style={styles.saveIpButtonText}>Sauvegarder IP</Text>
        </TouchableOpacity>
      </View>

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

      {espIp && (
        <View style={styles.espIpContainer}>
          <Text style={styles.espIpText}>ESP32 IP: {espIp}</Text>
        </View>
      )}

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
  ipInputContainer: {
    padding: 10,
    backgroundColor: '#222',
    margin: 10,
    borderRadius: 8,
    zIndex: 20,
  },
  ipInput: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 16,
  },
  saveIpButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 6,
  },
  saveIpButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
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
  espIpContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    backgroundColor: '#00000080',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 20,
  },
  espIpText: {
    color: 'white',
    fontWeight: 'bold',
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
