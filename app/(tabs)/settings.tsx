import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const [ip, setIp] = useState('');

  const saveIP = async () => {
    if (!ip.startsWith('http://')) {
      Alert.alert('Erreur', "L'IP doit commencer par http://");
      return;
    }

    try {
      await AsyncStorage.setItem('esp32_ip', ip);
      Alert.alert('Succès', 'Adresse IP enregistrée');
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'enregistrer l'IP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Adresse IP de l’ESP32 :</Text>
      <TextInput
        style={styles.input}
        placeholder="http://192.168.1.184"
        value={ip}
        onChangeText={setIp}
      />
      <Button title="Enregistrer" onPress={saveIP} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
});
