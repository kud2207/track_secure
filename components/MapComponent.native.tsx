import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapComponent() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = useRef<MapView | null>(null);

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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...currentPosition,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true} // montre le point bleu natif d'iOS/Android
        followsUserLocation={false}
      >
        {/* Si tu veux aussi un Marker personnalisé */}
        <Marker
          coordinate={currentPosition}
          title="Moi"
          description="Position actuelle"
          pinColor="blue"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    margin: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  map: {
    width: Dimensions.get('window').width - 20,
    height: Dimensions.get('window').height - 100,
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
});
