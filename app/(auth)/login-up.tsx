import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ToastAndroid,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  RadioButton,
  Dialog,
  Portal,
  ActivityIndicator,
} from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";
import { supabase } from "@/utils/supabase";


const Register = ({ }) => {
  const [formData, setFormData] = useState({
    numeroTelephone: "",
    nom: "",
    prenom: "",
    sexe: "",
    motDePasse: "",
    confirmerMotDePasse: "",
  });

  const [errors, setErrors] = useState({
    numeroTelephone: false,
    nom: false,
    prenom: false,
    sexe: false,
    motDePasse: false,
    confirmerMotDePasse: false,
  });

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntry2, setSecureTextEntry2] = useState(true);
  const [visible, setVisible] = useState(false);
  const [errorAf, setErrorAf] = useState("");

  const handleChange = (field: any, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: false });
    setErrorAf("");
  };

  const validateField = (field: any, value: any) => {
    setErrors((prev) => ({ ...prev, [field]: value.trim() === "" }));
  };

  const handleFormSubmit = () => {
    const { numeroTelephone, nom, sexe, motDePasse, confirmerMotDePasse } = formData;

    if (!numeroTelephone || !nom || !sexe || !motDePasse || !confirmerMotDePasse) {
      setErrorAf("Veuillez remplir tous les champs.");
      return;
    }

    if (!/[A-Z]/.test(motDePasse) || !/[0-9]/.test(motDePasse) || motDePasse.length < 6) {
      setErrorAf("Le mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre.");
      return;
    }

    if (motDePasse !== confirmerMotDePasse) {
      setErrorAf("Les mots de passe ne correspondent pas.");
      return;
    }

    setErrorAf("isCorrect");
    setTimeout(() => setVisible(true), 700);
  };

  const hideDialog = () => {
    setVisible(false);
    setErrorAf("");
  };

  const confirmRegister = async () => {
    const { numeroTelephone, nom, prenom, sexe, motDePasse } = formData;

    const { data, error } = await supabase
      .from("proprietaire_vehicule")
      .insert([
        {
          numero_tel: numeroTelephone.trim(),
          nom: nom.trim(),
          prenom: prenom.trim(),
          sexe: sexe.trim(),
          password: motDePasse.trim(),
        }
      ]);

    if (error) {
      console.log(error);
      setErrorAf("Erreur lors de l'enregistrement.");
      return;
    } else {
      ToastAndroid.show(
        'Inscription réussie ! \n Veuillez vous connecter pour continuer',
        ToastAndroid.SHORT
      );
    }
    setVisible(false);
    // Redirection vers la page de connexion

    router.push("/(auth)/login-in");

  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.imageBG}
        resizeMode="cover"
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Images "light" en haut */}
        <View style={styles.contenaireImg}>
          <Animated.Image
            entering={FadeInUp.delay(200).duration(1000).springify().damping(4)}
            style={styles.imgTOP1}
            source={require("../../assets/images/light.png")}
            resizeMode="contain"
          />
          <Animated.Image
            entering={FadeInUp.delay(400).duration(1000).springify().damping(4)}
            style={styles.imgTOP2}
            source={require("../../assets/images/light.png")}
            resizeMode="contain"
          />
        </View>

        <Animated.View style={styles.contenaireForm}>
          <View style={styles.contenaireLOGIN}>
            <TouchableOpacity style={[styles.loginICON, { backgroundColor: "#3b5998" }]}>
              <Icon name="user-circle-o" size={38} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Numéro de téléphone */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.inputContainer}>
            <TextInput
              label="Numéro de Téléphone"
              value={formData.numeroTelephone}
              onChangeText={(value) => handleChange("numeroTelephone", value)}
              onBlur={() => validateField("numeroTelephone", formData.numeroTelephone)}
              style={styles.input}
              mode="outlined"
              error={errors.numeroTelephone}
              keyboardType="numeric"
              left={<TextInput.Icon icon="phone" />}
              maxLength={9}
            />
          </Animated.View>

          {/* Nom */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.inputContainer}>
            <TextInput
              label="Nom"
              value={formData.nom}
              onChangeText={(value) => handleChange("nom", value)}
              onBlur={() => validateField("nom", formData.nom)}
              style={styles.input}
              mode="outlined"
              error={errors.nom}
              left={<TextInput.Icon icon="account" />}
            />
          </Animated.View>

          {/* PreNom */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.inputContainer}>
            <TextInput
              label="Prénom"
              value={formData.prenom}
              onChangeText={(value) => handleChange("prenom", value)}
              onBlur={() => validateField("prenom", formData.prenom)}
              style={styles.input}
              mode="outlined"
              error={errors.prenom}
              left={<TextInput.Icon icon="account" />}
            />
          </Animated.View>

          {/* Sexe */}
          <View style={styles.inputContainer}>
            <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>Sexe</Text>
            <RadioButton.Group
              onValueChange={(value) => handleChange("sexe", value)}
              value={formData.sexe}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={styles.radioContainer}>
                  <RadioButton value="masculin" />
                  <Text>Masculin</Text>
                </View>
                <View style={styles.radioContainer}>
                  <RadioButton value="feminin" />
                  <Text>Féminin</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>


          {/* Mot de passe */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.inputContainer}>
            <TextInput
              label="Mot de passe"
              value={formData.motDePasse}
              onChangeText={(value) => handleChange("motDePasse", value)}
              onBlur={() => validateField("motDePasse", formData.motDePasse)}
              secureTextEntry={secureTextEntry}
              style={styles.input}
              mode="outlined"
              error={errors.motDePasse}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon icon="eye" onPress={() => setSecureTextEntry(!secureTextEntry)} />
              }
            />
          </Animated.View>

          {/* Confirmer mot de passe */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.inputContainer}>
            <TextInput
              label="Confirmer mot de passe"
              value={formData.confirmerMotDePasse}
              onChangeText={(value) => handleChange("confirmerMotDePasse", value)}
              onBlur={() => validateField("confirmerMotDePasse", formData.confirmerMotDePasse)}
              secureTextEntry={secureTextEntry2}
              style={styles.input}
              mode="outlined"
              error={errors.confirmerMotDePasse}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon icon="eye" onPress={() => setSecureTextEntry2(!secureTextEntry2)} />
              }
            />
          </Animated.View>

          {/* Ligne séparation "Créer un compte avec" */}
          <View style={styles.connectWithContainer}>
            <View style={styles.horizontalLine} />
            <Text style={styles.connectWithText}>Créer un compte avec</Text>
            <View style={styles.horizontalLine} />
          </View>

          {/* Boutons sociaux Google & Facebook */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.socialIconsContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#db4437" }]}
              onPress={() => alert("Google Login")}
            >
              <Icon name="google" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#3b5998" }]}
              onPress={() => alert("Facebook Login")}
            >
              <Icon name="facebook" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Message d'erreur ou loading */}
          <Animated.View entering={FadeInDown.duration(700).springify()}>
            <Text style={styles.errorText}>
              {errorAf === "isCorrect" ? <ActivityIndicator animating={true} color={"red"} /> : errorAf}
            </Text>
          </Animated.View>

          {/* Bouton créer un compte */}
          <Button
            icon={() => <Icon name="user-plus" size={20} color="white" />}
            mode="contained"
            onPress={handleFormSubmit}
            style={styles.button}
          >
            Créer un compte
          </Button>

          {/* Lien vers la page de connexion */}
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            J'ai déjà un compte ?{" "}
            <TouchableOpacity onPress={() => router.push('/(auth)/login-in')}>
              <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Se connecter</Text>
            </TouchableOpacity>
          </Text>

          {/* Dialog confirmation */}
          <Portal>
            <Dialog visible={visible} onDismiss={hideDialog}>
              <Dialog.Icon icon="account-check" size={50} color="#ff9810" />
              <Dialog.Title style={{ fontSize: 20, textAlign: 'center' }}>Voulez-vous enregistrer ces données ?</Dialog.Title>
              <Dialog.Content>
                <View style={styles.contenaireData}>
                  <Text style={styles.labelText}>Numéro de téléphone :</Text>
                  <Text>{formData.numeroTelephone}</Text>
                </View>
                <View style={styles.contenaireData}>
                  <Text style={styles.labelText}>Nom :</Text>
                  <Text>{formData.nom}</Text>
                </View>
                <View style={styles.contenaireData}>
                  <Text style={styles.labelText}>PreNom :</Text>
                  <Text>{formData.prenom}</Text>
                </View>
                <View style={styles.contenaireData}>
                  <Text style={styles.labelText}>Sexe :</Text>
                  <Text>{formData.sexe}</Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideDialog}>Annuler</Button>
                <Button onPress={confirmRegister}>Enregistrer</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageBG: {
    position: "absolute",
    width: "100%",
    height: "80%",
    top: 0,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
  contenaireImg: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
    marginTop: -20,
  },
  imgTOP1: {
    width: 120,
    height: 120,
    marginTop: -10
  },
  imgTOP2: {
    width: 120,
    height: 120,
    marginTop: -10
  },
  contenaireForm: {
    alignItems: "center",
    marginTop: 0,
    paddingHorizontal: 0,
  },
  contenaireLOGIN: {
    alignItems: "center",
    marginBottom: 10,
  },
  loginICON: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    marginVertical: 5,
  },
  input: {
    width: "100%",
    height: 50,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  connectWithContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  connectWithText: {
    marginHorizontal: 8,
    fontWeight: "bold",
    color: "#555",
    fontSize: 12,
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  button: {
    marginTop: 5,
    width: "100%",
    backgroundColor: "#ff9810",
    height: 45,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 5,
    minHeight: 20,
    fontSize: 12,
  },
  contenaireData: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  labelText: {
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default Register;
