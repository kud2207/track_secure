import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const [tab, setTab] = useState<'reglages' | 'utilisateur'>('reglages');
  const [espIp, setEspIp] = useState('');
  const [distance, setDistance] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const ip = await AsyncStorage.getItem('esp32_ip');
      if (ip) setEspIp(ip);
      const dist = await AsyncStorage.getItem('distance');
      if (dist) setDistance(dist);
      const notif = await AsyncStorage.getItem('notifications');
      setNotificationsEnabled(notif === 'true');

      const user = await AsyncStorage.getItem('userInfo');
      setUserData(user ? JSON.parse(user) : null);
    })();
  }, []);

  const saveSettings = async () => {
    await AsyncStorage.setItem('esp32_ip', espIp);
    await AsyncStorage.setItem('distance', distance);
    await AsyncStorage.setItem('notifications', notificationsEnabled.toString());
    Alert.alert('Succès', 'Paramètres enregistrés');
  };

  return (
    <View style={styles.container}>
      {/* Onglets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'reglages' && styles.activeTab]}
          onPress={() => setTab('reglages')}
        >
          <Text style={styles.tabText}>Réglages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'utilisateur' && styles.activeTab]}
          onPress={() => setTab('utilisateur')}
        >
          <Text style={styles.tabText}>Utilisateur</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu dynamique */}
      <ScrollView style={styles.content}>
        {tab === 'reglages' ? (
          <View>
            <Text style={styles.label}>Adresse IP ESP32</Text>
            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.104"
              value={espIp}
              onChangeText={setEspIp}
            />

            <View style={styles.row}>
              <Text style={styles.label}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </View>

            <Text style={styles.label}>Distance (mètres)</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.infoText}>Nom: {userData?.nom || '...'}</Text>
            <Text style={styles.infoText}>Prénom: {userData?.prenom || '...'}</Text>
            <Text style={styles.infoText}>Email: {userData?.email || '...'}</Text>
            <Text style={styles.infoText}>Numéro: {userData?.numero_tel || '...'}</Text>
            <Text style={styles.infoText}>Assurance: {userData?.assurance || '...'}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
});
