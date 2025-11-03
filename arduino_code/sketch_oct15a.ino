#include <WiFi.h>
#include <PubSubClient.h>
#include <HardwareSerial.h> //ignore

// -------------------- Wi-Fi Config --------------------
const char* ssid = "RVU";
const char* password = "Rvu$1234";

// -------------------- MQTT Config --------------------
const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;
const char* mqtt_client_id = "esp32_pzem_001";

WiFiClient espClient;
PubSubClient client(espClient);

// -------------------- PZEM Setup --------------------
#define PZEM_SERIAL Serial2
#define PZEM_ADDR 0x01
#define CMD_RIR 0x04

#define RESPONSE_SIZE 25
#define READ_TIMEOUT 100

#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17

// -------------------- Relay Setup --------------------
#define RELAY_PIN 5
bool relayState = false;

// -------------------- CRC16 Calculation --------------------
uint16_t modbusCRC16(const uint8_t *buf, int len) {
  uint16_t crc = 0xFFFF;
  for (int i = 0; i < len; i++) {
    crc ^= buf[i];
    for (int j = 0; j < 8; j++) {
      if (crc & 0x0001)
        crc = (crc >> 1) ^ 0xA001;
      else
        crc >>= 1;
    }
  }
  return crc;
}

// -------------------- Modbus Read Command --------------------
bool sendReadCommand(uint16_t startReg, uint16_t numRegs, uint8_t *response, uint8_t respLen) {
  uint8_t cmd[8];
  cmd[0] = PZEM_ADDR;
  cmd[1] = CMD_RIR;
  cmd[2] = (startReg >> 8) & 0xFF;
  cmd[3] = startReg & 0xFF;
  cmd[4] = (numRegs >> 8) & 0xFF;
  cmd[5] = numRegs & 0xFF;

  uint16_t crc = modbusCRC16(cmd, 6);
  cmd[6] = crc & 0xFF;
  cmd[7] = (crc >> 8) & 0xFF;

  while (PZEM_SERIAL.available()) PZEM_SERIAL.read();
  PZEM_SERIAL.write(cmd, 8);

  unsigned long startTime = millis();
  int index = 0;
  while ((millis() - startTime) < READ_TIMEOUT && index < respLen) {
    if (PZEM_SERIAL.available()) {
      response[index++] = PZEM_SERIAL.read();
    }
  }

  if (index != respLen) return false;

  uint16_t respCRC = modbusCRC16(response, respLen - 2);
  uint16_t receivedCRC = (response[respLen - 1] << 8) | response[respLen - 2];
  if (respCRC != receivedCRC) return false;

  if (response[0] != PZEM_ADDR || response[1] != CMD_RIR) return false;

  return true;
}

// -------------------- Read PZEM Data --------------------
bool readPZEM(float &voltage, float &current, float &power, float &energy, float &frequency, float &pf) {
  uint8_t response[RESPONSE_SIZE];
  if (!sendReadCommand(0x0000, 0x000A, response, RESPONSE_SIZE)) return false;

  voltage = ((response[3] << 8) | response[4]) / 10.0;
  current = ((uint32_t)(response[5] << 8 | response[6]) |
             (uint32_t)(response[7] << 24) |
             (uint32_t)(response[8] << 16)) / 1000.0;
  power = ((uint32_t)(response[9] << 8 | response[10]) |
           (uint32_t)(response[11] << 24) |
           (uint32_t)(response[12] << 16)) / 10.0;
  energy = ((uint32_t)(response[13] << 8 | response[14]) |
            (uint32_t)(response[15] << 24) |
            (uint32_t)(response[16] << 16)) / 1000.0;
  frequency = ((response[17] << 8) | response[18]) / 10.0;
  pf = ((response[19] << 8) | response[20]) / 100.0;

  return true;
}

// -------------------- MQTT Relay Control Callback --------------------
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.printf("📩 MQTT Message on [%s]: %s\n", topic, message.c_str());

  if (String(topic) == "power/relay") {
    if (message == "ON") {
      relayState = true;
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("⚡ Relay turned ON");
    } else if (message == "OFF") {
      relayState = false;
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("🚫 Relay turned OFF");
    } else if (message == "TOGGLE") {
      relayState = !relayState;
      digitalWrite(RELAY_PIN, relayState ? HIGH : LOW);
      Serial.printf("🔁 Relay toggled %s\n", relayState ? "ON" : "OFF");
    }
  }
}

// -------------------- MQTT Reconnect --------------------
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(mqtt_client_id)) {
      Serial.println("connected ✅");
      client.subscribe("power/relay"); // Listen for relay control
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5s...");
      delay(5000);
    }
  }
}

// -------------------- Setup --------------------
void setup() {
  Serial.begin(115200);
  PZEM_SERIAL.begin(9600, SERIAL_8N1, PZEM_RX_PIN, PZEM_TX_PIN);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  Serial.println("\n🔌 PZEM-004T v4 + Relay + MQTT Starting...");
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("🌐 IP: ");
  Serial.println(WiFi.localIP());

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// -------------------- Loop --------------------
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 3000) { // every 3 seconds
    float voltage, current, power, energy, frequency, pf;
    if (readPZEM(voltage, current, power, energy, frequency, pf)) {
      client.publish("power/voltage", String(voltage, 2).c_str());
      client.publish("power/current", String(current, 3).c_str());
      client.publish("power/power", String(power, 2).c_str());
      client.publish("power/energy", String(energy, 3).c_str());
      client.publish("power/frequency", String(frequency, 2).c_str());
      client.publish("power/powerFactor", String(pf, 2).c_str());
      client.publish("power/relayStatus", relayState ? "ON" : "OFF");
    } else {
      Serial.println("⚠️ Failed to read PZEM data");
    }
    lastPublish = millis();
  }
}
