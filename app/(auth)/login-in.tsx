import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/utils/supabase";
import { ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginIn: React.FC = () => {
  const [formData, setFormData] = useState({ phoneNumber: "", password: "" });
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLogin = async () => {
    const { phoneNumber, password } = formData;

    if (!phoneNumber || !password) {
      ToastAndroid.show("Veuillez remplir tous les champs.", ToastAndroid.SHORT);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from("proprietaire_vehicule")
      .select("*")
      .eq("numero_tel", phoneNumber.trim())
      .eq("password", password.trim())
      .single();

    if (error || !data) {
      setIsLoading(false);
      ToastAndroid.show("Téléphone ou mot de passe incorrect.", ToastAndroid.SHORT);
      return;
    }
    // Sauvegarde dans AsyncStorage
    await AsyncStorage.setItem('userInfo', JSON.stringify({
      nom: data.nom,
      prenom: data.prenom,
      numero_tel: data.numero_tel
    }));


    // Connexion réussie
    ToastAndroid.show(`Bienvenue ${data.prenom || ""}`, ToastAndroid.SHORT);
    setIsLoading(false);
    router.push("/(tabs)");
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
        <View style={styles.contenaireImg}>
          <Animated.Image
            entering={FadeInUp.delay(200).duration(1000).springify().damping(5)}
            style={styles.imgTOP1}
            source={require("../../assets/images/light.png")}
            resizeMode="contain"
          />
          <Animated.Image
            entering={FadeInUp.delay(400).duration(1000).springify().damping(5)}
            style={styles.imgTOP2}
            source={require("../../assets/images/light.png")}
            resizeMode="contain"
          />
        </View>

        <Animated.View style={styles.contenaireForm}>
          <View style={[styles.contenaireLOGIN, { marginTop: -50, marginBottom: 70 }]}>
            <TouchableOpacity style={[styles.loginICON, { backgroundColor: "#3b5998" }]}>
              <FontAwesome name="user" size={35} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.welcomeText}>Welcom To TackSecure !</Text>
          </View>

          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.inputContainer}>
            <TextInput
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="phone" />}
              maxLength={9}
              keyboardType="phone-pad"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry={secureTextEntry}
              style={[styles.input, { marginBottom: 10 }]}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? "eye-off" : "eye"}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
            />
          </Animated.View>

          <View style={styles.connectWithContainer}>
            <View style={styles.horizontalLine} />
            <Text style={styles.connectWithText}>Connect with</Text>
            <View style={styles.horizontalLine} />
          </View>

          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.socialIconsContainer}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#db4437" }]}>
              <FontAwesome name="google" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#3b5998" }]}>
              <FontAwesome name="facebook" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700).springify()}>
            {isLoading && <ActivityIndicator animating={true} color="#007bff" />}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700).springify()}>
            <Button
              icon={() => <FontAwesome name="sign-in" size={20} color="white" />}
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Login"}
            </Button>
          </Animated.View>

          <Text style={{ marginTop: 10 }}>
            Don't have an account?{" "}
            <Text style={{ color: "#007bff" }} onPress={() => router.push("/(auth)/login-up")}>
              SignUp
            </Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default LoginIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBG: {
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-around",
    width: "100%",
  },
  contenaireImg: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  imgTOP1: {
    height: 130,
  },
  imgTOP2: {
    height: 100,
  },
  contenaireForm: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 180,
  },
  contenaireLOGIN: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loginICON: {
    borderRadius: 50,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
  },
  welcomeText: {
    marginTop: 1,
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontWeight: "900",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
    width: "90%",
  },
  input: {
    width: "100%",
    height: 48,
    fontSize: 16,
    backgroundColor: "white",
  },
  button: {
    marginTop: 10,
    width: 300,
    backgroundColor: "#ff9810",
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "60%",
    marginTop: 0,
  },
  socialButton: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 47,
    height: 47,
    borderColor: "white",
    borderStyle: "solid",
    borderWidth: 1,
    marginBottom: 5,
  },
  connectWithContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  horizontalLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#d3d3d3",
  },
  connectWithText: {
    color: "#888",
    marginHorizontal: 10,
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
  },
});
