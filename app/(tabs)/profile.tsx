import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TextInput, Alert } from 'react-native';
import { Avatar, Text, Button, ActivityIndicator } from 'react-native-paper';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from "@expo/vector-icons";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editedData, setEditedData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('userInfo');
      const parsed = stored ? JSON.parse(stored) : null;

      if (!parsed?.numero_tel) throw new Error("Numéro non trouvé dans AsyncStorage");

      const { data, error } = await supabase
        .from('proprietaire_vehicule')
        .select('*')
        .eq('numero_tel', parsed.numero_tel)
        .single();

      if (error) {
        console.log('Erreur Supabase:', error.message);
        setUserData(null);
      } else {
        setUserData(data);
        setEditedData(data); // Initialise les champs modifiables
      }
    } catch (err) {
      console.error('Erreur récupération:', err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleEdit = (field: string) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleConfirm = async (field: string) => {
    const { numero_tel } = userData;
    const updates = { [field]: editedData[field] };

    const { error } = await supabase
      .from('proprietaire_vehicule')
      .update(updates)
      .eq('numero_tel', numero_tel);

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setUserData({ ...userData, ...updates });
      setEditMode({ ...editMode, [field]: false });
    }
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${(nom?.[0] || '').toUpperCase()}${(prenom?.[0] || '').toUpperCase()}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} color="#ff9810" />
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text>Profil non trouvé.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserData} />}
    >
      <Avatar.Text
        size={80}
        label={getInitials(userData.nom, userData.prenom)}
        style={styles.avatar}
        labelStyle={{ fontWeight: 'bold', fontSize: 24 }}
      />

      <View style={styles.card}>
        <Text style={styles.title}>Informations personnelles</Text>
        <EditableInfo label="Nom" field="nom" />
        <EditableInfo label="Prénom" field="prenom" />
        <EditableInfo label="Sexe" field="sexe" />
        <EditableInfo label="Email" field="email" />
        <EditableInfo label="Téléphone" field="numero_tel" editable={false} />
        <EditableInfo label="Ville" field="ville_residence" />
        <EditableInfo label="Quartier" field="quartier_residence" />
        <EditableInfo label="Pays" field="pays_residence" />

      </View>
    </ScrollView>
  );

  function EditableInfo({ label, field, editable = true }: { label: string; field: string; editable?: boolean }) {
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label} :</Text>
        {editMode[field] && editable ? (
          <>
            <TextInput
              style={styles.input}
              value={editedData[field] || ''}
              onChangeText={(text) => setEditedData({ ...editedData, [field]: text })}
            />
            <Button mode="text" onPress={() => handleConfirm(field)}>
            <FontAwesome name="check" size={20} color="green" />
            </Button>
          </>
        ) : (
          <>
            <Text style={styles.infoValue}>{userData[field] || '-'}</Text>
            {editable && <Button mode="text" onPress={() => handleEdit(field)}>           
              <FontAwesome name="edit" size={20} color=""style={{left:10}} />
              </Button>}
          </>
        )}
      </View>
    );
  }
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#ff9810',
    marginBottom: -20,
    zIndex:2
  },
  card: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#444',
    flex: 1,
  },
  infoValue: {
    color: '#333',
    flex: 2,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flex: 2,
    marginHorizontal: 10,
  },
});
