import React, { useState } from "react";
import { View, StyleSheet, StatusBar, ImageBackground, TouchableOpacity } from "react-native";
import { TextInput, Button, ActivityIndicator, Text } from "react-native-paper";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/utils/supabase";

const LoginIn: React.FC = () => {
  const [formData, setFormData] = useState({ 
    phoneNumber: "", 
    password: "" 
  });
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
  
    try {
      const { data, error: supabaseError } = await supabase
        .from("proprietaire_vehicule")
        .select("*")
        .eq("numero_tel", formData.phoneNumber)
        .eq("password", formData.password)
        .single();
  
      if (supabaseError || !data) {
        throw new Error("Numéro ou mot de passe incorrect");
      }
  
      // ✅ Connexion réussie
      router.replace("/(tabs)");
      
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.imageBG}
        resizeMode="cover"
      />

      <View style={styles.contentContainer}>
        <Animated.View style={styles.contenaireForm}>
          <View style={styles.contenaireLOGIN}>
            <TouchableOpacity style={styles.loginICON}>
              <FontAwesome name="user" size={35} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.welcomeText}>Connexion</Text>
          </View>

          <TextInput
            label="Numéro de téléphone"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
            keyboardType="phone-pad"
          />

          <TextInput
            label="Mot de passe"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? "eye-off" : "eye"}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Vérification..." : "Se connecter"}
          </Button>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBG: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  contenaireForm: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 10,
  },
  contenaireLOGIN: {
    alignItems: "center",
    marginBottom: 30,
  },
  loginICON: {
    backgroundColor: "#3b5998",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "white",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#ff9810",
    paddingVertical: 5,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default LoginIn;