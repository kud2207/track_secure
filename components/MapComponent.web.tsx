import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        🌐 La carte n'est pas disponible sur le Web avec react-native-maps.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, textAlign: 'center' },
});
