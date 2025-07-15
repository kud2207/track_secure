#include <WiFi.h>
#include <TinyGPSPlus.h>
#include <WebServer.h>

// === Wi-Fi ===
const char* ssid = "QWERTY";
const char* password = "1234567890";

// IP fixe
IPAddress local_ip(192, 168, 137, 200);
IPAddress gateway(192, 168, 137, 1);
IPAddress subnet(255, 255, 255, 0);

// === GPS (UART2) ===
#define RXD2 16
#define TXD2 17
#define GPSBaud 9600
TinyGPSPlus gps;
HardwareSerial neogps(2);

// === Buzzer ===
const int buzzerPin = 12;

// === Serveur HTTP ===
WebServer server(80);

void handleOn() {
  digitalWrite(buzzerPin, HIGH);
  server.send(200, "text/plain", "Buzzer ON");
}

void handleOff() {
  digitalWrite(buzzerPin, LOW);
  server.send(200, "text/plain", "Buzzer OFF");
}

void handleGPS() {
  String response;
  if (gps.location.isValid()) {
    response = "{";
    response += "\"lat\":" + String(gps.location.lat(), 6) + ",";
    response += "\"lon\":" + String(gps.location.lng(), 6) + ",";
    response += "\"alt\":" + String(gps.altitude.meters(), 2);
    response += "}";
  } else {
    response = "{\"message\":\"Pas de fix GPS\"}";
  }

  server.send(200, "application/json", response);
}

void setup() {
  Serial.begin(115200);
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);

  neogps.begin(GPSBaud, SERIAL_8N1, RXD2, TXD2);
  WiFi.config(local_ip, gateway, subnet);
  WiFi.begin(ssid, password);

  Serial.print("Connexion Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Wi-Fi connecté !");
  Serial.println(WiFi.localIP());

  // Routes HTTP
  server.on("/on", handleOn);
  server.on("/off", handleOff);
  server.on("/gps", handleGPS);

  server.begin();
}

void loop() {
  // Lire les trames GPS
  while (neogps.available()) {
    gps.encode(neogps.read());
  }

  // Traiter les requêtes
  server.handleClient();
}
