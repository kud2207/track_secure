import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { Modal, Pressable, Linking, Vibration } from 'react-native';
import { Audio } from 'expo-av';



export default function MapComponent() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [vehicule, setVehicule] = useState<any>(null);
  const [isBuzzerOn, setIsBuzzerOn] = useState(false);
  const [espIp, setEspIp] = useState<string | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const vibrationInterval = useRef<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);


  const [vehiculeStep, setVehiculeStep] = useState(1.2); // index de position simulée
  const maxStep = 10; // tu peux l'augmenter
  const [showCallModal, setShowCallModal] = useState(false);

  // Simule la position du véhicule
  const getVehiculePosition = () => {
    if (!location) return null;
    const offset = 0.0002;

    return {
      latitude: location.coords.latitude + offset * vehiculeStep,
      longitude: location.coords.longitude + offset * vehiculeStep,
    };
  };

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

      setEspIp('http://192.168.43.200');
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

      if (action === 'on') {
        // ▶️ Démarre vibration en boucle toutes les 2 secondes
        vibrationInterval.current = setInterval(() => {
          Vibration.vibrate(2000); // 1s de vibration
        }, 4000);

        // Charger et jouer le son en boucle
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/abc.mp3'), // ← adapte ce chemin à ton projet
          { shouldPlay: true, isLooping: true }
        );
        soundRef.current = sound;
      } else {
        // ⏹️ Arrête les vibrations
        if (vibrationInterval.current) {
          clearInterval(vibrationInterval.current);
          vibrationInterval.current = null;
        }
        Vibration.cancel(); // stoppe la vibration en cours
        // Stop son
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
      }
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

  const moiPosition = {
    latitude: currentPosition.latitude + 0.0002,
    longitude: currentPosition.longitude + 0.0002,
  };

  const vehiculePosition = getVehiculePosition();

  const avancer = () => {
    setVehiculeStep((prev) => Math.min(prev + 1, maxStep));
  };

  const reculer = () => {
    setVehiculeStep((prev) => Math.max(prev - 1, 0));
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
        {/* Marqueur Moi */}
        <Marker
          coordinate={moiPosition}
          title="Moi"
          description="Position actuelle"
          pinColor="blue"
        />

        {/* Marqueur Véhicule */}
        {vehiculePosition && (
          <Marker
            coordinate={vehiculePosition}
            title="Véhicule"
            description="Position simulée"
            pinColor="red"
          />
        )}
      </MapView>

      {/* Boutons avancer/reculer */}
      <View style={styles.leftButtons}>
        <TouchableWithoutFeedback style={styles.navButton} onPress={avancer}>
          <Text style={styles.navButtonText}>2</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback style={styles.navButton} onPress={reculer}>
          <Text style={styles.navButtonText}>3</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback style={styles.navButton} onPress={toggleBuzzer}>
          <Text style={styles.navButtonText}>7</Text>
        </TouchableWithoutFeedback>

      </View>

      {/* Boutons buzzer & phone */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowCallModal(true)}>
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
      <Modal
        visible={showCallModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCallModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contacter un service</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => Linking.openURL('tel:117')}
            >
              <Text style={styles.modalButtonText}>Police</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => Linking.openURL('tel:113')}
            >
              <Text style={styles.modalButtonText}>Gendarmerie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>TrackSecure</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => Linking.openURL('tel:000')}
            >
              <Text style={styles.modalButtonText}>📞 Autre numéro</Text>
            </TouchableOpacity>

            <Pressable
              style={[styles.modalButton, { backgroundColor: '#ccc' }]}
              onPress={() => setShowCallModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: '#000' }]}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  leftButtons: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 1000,
  },
  navButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 18,
    width: 200,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },

  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginVertical: 6,
    width: 120,
    alignItems: 'center',
  },

  modalButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },


});