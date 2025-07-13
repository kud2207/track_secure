#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "-YDS_v2-";       // Réseau Wi-Fi existant
const char* password = "00000000";   // Mot de passe du Wi-Fi

const int buzzerPin = 12;
WebServer server(80);

// Adresse IP fixe pour l’ESP32 dans le réseau local
IPAddress local_ip(192, 168, 184, 100);   // Doit être libre dans le réseau
IPAddress gateway(192, 168, 184, 1);      // Passerelle (généralement .1)
IPAddress subnet(255, 255, 255, 0);       // Masque

void handleOn() {
  digitalWrite(buzzerPin, HIGH);
  server.send(200, "text/plain", "Buzzer ON");
  Serial.println("Buzzer ON via HTTP");
}

void handleOff() {
  digitalWrite(buzzerPin, LOW);
  server.send(200, "text/plain", "Buzzer OFF");
  Serial.println("Buzzer OFF via HTTP");
}

void setup() {
  Serial.begin(115200);
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);

  // Configurer l’IP fixe avant de se connecter
  WiFi.config(local_ip, gateway, subnet);

  Serial.println("Connexion au Wi-Fi...");
  WiFi.begin(ssid, password);

  // Attente de connexion
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Connecté au Wi-Fi !");
  Serial.print("Adresse IP : ");
  Serial.println(WiFi.localIP());

  // Démarrage du serveur HTTP
  server.on("/on", handleOn);
  server.on("/off", handleOff);
  server.begin();
  Serial.println("Serveur HTTP lancé.");
}

void loop() {
  server.handleClient();
}
