import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  TextInput,
  Switch,
  Button,
  SegmentedButtons,
  Divider,
  Card,
  Title,
  Paragraph,
} from 'react-native-paper';

export default function Settings() {
  const [tab, setTab] = useState<'reglages' | 'utilisateur'>('reglages');
  const [espIp, setEspIp] = useState('');
  const [distance, setDistance] = useState('10');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const ip = await AsyncStorage.getItem('esp32_ip');
      const dist = await AsyncStorage.getItem('distance');
      const notif = await AsyncStorage.getItem('notifications');
      const user = await AsyncStorage.getItem('userInfo');

      if (ip) setEspIp(ip);
      if (dist) setDistance(dist);
      setNotificationsEnabled(notif === 'true');
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
      {/* Tabs */}
      <SegmentedButtons
        value={tab}
        onValueChange={(value) => setTab(value as any)}
        buttons={[
          { value: 'reglages', label: 'Réglages' },
          { value: 'utilisateur', label: 'Utilisateur' },
        ]}
        style={styles.segmented}
      />

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'reglages' ? (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Title>Connexion ESP32</Title>
                <TextInput
                  mode="outlined"
                  label="Adresse IP ESP32"
                  placeholder="http://192.168.x.x"
                  value={espIp}
                  onChangeText={setEspIp}
                  style={styles.input}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Déclenchement</Title>
                <Paragraph>Distance de détection (mètres)</Paragraph>
                <SegmentedButtons
                  value={distance}
                  onValueChange={setDistance}
                  buttons={[
                    { value: '5', label: '5m' },
                    { value: '10', label: '10m' },
                    { value: '15', label: '15m' },
                  ]}
                  style={{ marginTop: 10 }}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Notifications</Title>
                <View style={styles.row}>
                  <Text>Activer les notifications</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                </View>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={saveSettings}
              style={styles.saveButton}
            >
              Enregistrer les réglages
            </Button>
          </>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Informations utilisateur</Title>
              <Divider style={{ marginVertical: 10 }} />
              <Text>Nom: {userData?.nom || '...'}</Text>
              <Text>Prénom: {userData?.prenom || '...'}</Text>
              <Text>Email: {userData?.email || '...'}</Text>
              <Text>Numéro: {userData?.numero_tel || '...'}</Text>
              <Text>Assurance: {userData?.assurance || '...'}</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  segmented: {
    margin: 12,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginTop: 10,
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 20,
    alignSelf: 'center',
    width: '90%',
    borderRadius: 6,
  },
});
