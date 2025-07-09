#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "tes couilles";        // Remplace par ton SSID Wi-Fi
const char* password = "0987654312";     // Remplace par ton mot de passe

IPAddress local_IP(192, 168, 137, 200);  // IP statique à adapter
IPAddress gateway(192, 168, 137, 1);
IPAddress subnet(255, 255, 255, 0);

WebServer server(80);

void setup() {
  Serial.begin(115200);

  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("Erreur de configuration IP statique");
  }

  WiFi.begin(ssid, password);
  Serial.print("Connexion au Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnecté au Wi-Fi");
  Serial.print("Adresse IP : ");
  Serial.println(WiFi.localIP());

  pinMode(26, OUTPUT);

  server.on("/on", []() {
    digitalWrite(26, HIGH);
    server.send(200, "text/plain", "Buzzer ON");
  });

  server.on("/off", []() {
    digitalWrite(26, LOW);
    server.send(200, "text/plain", "Buzzer OFF");
  });

  server.begin();
}

void loop() {
  server.handleClient();
}
