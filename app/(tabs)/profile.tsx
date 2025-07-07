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

  const [vehiculeExiste, setVehiculeExiste] = useState(false);
  const [vehiculeData, setVehiculeData] = useState({ immatriculation: '', marque: '', couleur: '' });
  const [vehiculeInfo, setVehiculeInfo] = useState<any>(null);
  const [vehiculeEditMode, setVehiculeEditMode] = useState<{ [key: string]: boolean }>({});

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
        setEditedData(data);
      }
    } catch (err) {
      console.error('Erreur récupération:', err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicule = async () => {
    const { numero_tel } = userData || {};
    if (!numero_tel) return;

    const { data, error } = await supabase
      .from('vehicule')
      .select('*')
      .eq('proprietaire_vehicule_numero', numero_tel)
      .single();

    if (data) {
      setVehiculeExiste(true);
      setVehiculeInfo(data);
    } else {
      setVehiculeExiste(false);
      setVehiculeInfo(null);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) fetchVehicule();
  }, [userData]);

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

  const handleAddVehicule = async () => {
    if (!vehiculeData.immatriculation || !vehiculeData.marque || !vehiculeData.couleur) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs du véhicule.");
      return;
    }

    const { numero_tel } = userData;

    const { error } = await supabase.from('vehicule').insert({
      ...vehiculeData,
      proprietaire_vehicule_numero: numero_tel,
    });

    if (error) {
      Alert.alert("Erreur lors de l'ajout du véhicule", error.message);
    } else {
      Alert.alert("Succès", "Véhicule ajouté avec succès !");
      setVehiculeData({ immatriculation: '', marque: '', couleur: '' });
      fetchVehicule();
    }
  };

  const handleConfirmVehicule = async (field: string) => {
    const updates = { [field]: vehiculeInfo[field] };

    const { error } = await supabase
      .from('vehicule')
      .update(updates)
      .eq('id', vehiculeInfo.id);

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setVehiculeEditMode({ ...vehiculeEditMode, [field]: false });
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

    {/*partie vehicule*/}
      <Avatar.Icon icon="car" size={80} style={styles.avatar} />
      <View style={styles.card}>
        <Text style={styles.title}>Véhicule</Text>

        {vehiculeExiste ? (
          <>
            <EditableVehiculeInfo label="Immatricul" field="immatriculation" />
            <EditableVehiculeInfo label="Marque" field="marque" />
            <EditableVehiculeInfo label="Couleur" field="couleur" />
          </>
        ) : (
          <>
            <TextInput
              placeholder="Immatriculation"
              value={vehiculeData.immatriculation}
              onChangeText={(text) => setVehiculeData({ ...vehiculeData, immatriculation: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Marque"
              value={vehiculeData.marque}
              onChangeText={(text) => setVehiculeData({ ...vehiculeData, marque: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Couleur"
              value={vehiculeData.couleur}
              onChangeText={(text) => setVehiculeData({ ...vehiculeData, couleur: text })}
              style={styles.input}
            />
            <Button mode="contained" onPress={handleAddVehicule} style={{ marginTop: 10 }}>
              Ajouter le véhicule
            </Button>
          </>
        )}
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
              style={[styles.input]}
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
            {editable && (
              <Button mode="text" onPress={() => handleEdit(field)}>
                <FontAwesome name="edit" size={20} style={{ left: 10 }} />
              </Button>
            )}
          </>
        )}
      </View>
    );
  }

  function EditableVehiculeInfo({ label, field }: { label: string; field: string }) {
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel} numberOfLines={1} ellipsizeMode="tail">{label} :</Text>
        {vehiculeEditMode[field] ? (
          <>
            <TextInput
              style={styles.input}
              value={vehiculeInfo[field] || ''}
              onChangeText={(text) => setVehiculeInfo({ ...vehiculeInfo, [field]: text })}
              
            />
            <Button mode="text" onPress={() => handleConfirmVehicule(field)}>
              <FontAwesome name="check" size={20} color="green" />
            </Button>
          </>
        ) : (
          <>
            <Text style={styles.infoValue}>{vehiculeInfo[field] || '-'}</Text>
            <Button mode="text" onPress={() => setVehiculeEditMode({ ...vehiculeEditMode, [field]: true })}>
              <FontAwesome name="edit" size={20} />
            </Button>
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
    zIndex: 2,
  },
  card: {
    width: '100%',
    borderTopRightRadius:30,
    borderTopLeftRadius:30,
    borderRadius:8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
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
    gap: 0
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
  vehicleAvatar: {
    backgroundColor: '#ff9810',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },

});
