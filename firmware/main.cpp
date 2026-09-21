/**
 * ============================================================================
 * LADAKH-SHIELD — Embedded Firmware
 * Universal Smart Protection & Monitoring System for High-Altitude Equipment
 * 
 * Pipeline: SENSE → ANALYZE → PROTECT → ALERT → RECORD
 * Target: ESP32 (Dual-Core 240MHz)
 * ============================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <Adafruit_INA219.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <LoRa.h>
#include <SD.h>

#include "config.h"
#include "telemetry.h"

// Peripherals
Adafruit_BME280 bme;
Adafruit_INA219 ina219(ADDR_INA219);
Adafruit_SSD1306 display(128, 64, &Wire, -1);
File logFile;

// Global Telemetry Instance
TelemetryData telemetry;

// Timing Keepers
unsigned long lastSampleTime = 0;
unsigned long lastLoraTime   = 0;
unsigned long lastFlushTime  = 0;

// Device Detection Flags
bool hasBME280 = false;
bool hasINA219 = false;
bool hasOLED   = false;
bool hasLoRa   = false;
bool hasSD     = false;

// ============================================================================
// INITIALIZATION ROUTINES
// ============================================================================

void setupActuators() {
  pinMode(PIN_LED_NORMAL, OUTPUT);
  pinMode(PIN_LED_ALERT, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  
  digitalWrite(PIN_LED_NORMAL, LOW);
  digitalWrite(PIN_LED_ALERT, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  // Configure PWM for Heater & Fan MOSFETs
  ledcSetup(PWM_HEATER_CHANNEL, PWM_FREQ_HZ, PWM_RESOLUTION_BITS);
  ledcAttachPin(PIN_MOSFET_HEATER, PWM_HEATER_CHANNEL);
  ledcWrite(PWM_HEATER_CHANNEL, 0); // Off by default

  ledcSetup(PWM_FAN_CHANNEL, PWM_FREQ_HZ, PWM_RESOLUTION_BITS);
  ledcAttachPin(PIN_MOSFET_FAN, PWM_FAN_CHANNEL);
  ledcWrite(PWM_FAN_CHANNEL, 0);    // Off by default
}

void triggerBeep(uint16_t freq, uint16_t durationMs) {
  tone(PIN_BUZZER, freq, durationMs);
}

void setupSensorsAndBuses() {
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN, I2C_FREQ_HZ);

  // 1. OLED SSD1306
  if (display.begin(SSD1306_SWITCHCAPVCC, ADDR_OLED)) {
    hasOLED = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 15);
    display.println("LADAKH-SHIELD");
    display.setCursor(10, 30);
    display.println("BOOTING FIRMWARE...");
    display.display();
  }

  // 2. BME280 Environmental Sensor
  if (bme.begin(ADDR_BME280, &Wire)) {
    hasBME280 = true;
    // Configure recommended weather monitoring mode
    bme.setSampling(Adafruit_BME280::MODE_NORMAL,
                    Adafruit_BME280::SAMPLING_X1, // Temp
                    Adafruit_BME280::SAMPLING_X1, // Pressure
                    Adafruit_BME280::SAMPLING_X1, // Humidity
                    Adafruit_BME280::FILTER_X2);
    Serial.println(F("[INIT] BME280 Environmental sensor detected."));
  } else {
    Serial.println(F("[WARN] BME280 not responding on 0x76."));
  }

  // 3. INA219 Power Monitor
  if (ina219.begin(&Wire)) {
    hasINA219 = true;
    Serial.println(F("[INIT] INA219 High-side power sensor detected."));
  } else {
    Serial.println(F("[WARN] INA219 not responding on 0x40."));
  }

  // 4. SPI Bus for LoRa & MicroSD
  SPI.begin(SPI_SCK_PIN, SPI_MISO_PIN, SPI_MOSI_PIN);

  // 5. MicroSD Module
  if (SD.begin(SD_CS_PIN)) {
    hasSD = true;
    Serial.println(F("[INIT] MicroSD Card initialized."));
    if (!SD.exists("/datalog.csv")) {
      logFile = SD.open("/datalog.csv", FILE_WRITE);
      if (logFile) {
        logFile.println("Timestamp_ms,Temp_C,Pressure_kPa,Humidity_pct,Voltage_V,Current_A,Power_W,Batt_pct,Heater,Fan,State,Fault");
        logFile.close();
      }
    }
  } else {
    Serial.println(F("[WARN] MicroSD initialization failed."));
  }

  // 6. LoRa SX1278
  LoRa.setPins(LORA_CS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);
  if (LoRa.begin(LORA_BAND_HZ)) {
    hasLoRa = true;
    LoRa.setTxPower(LORA_TX_POWER);
    LoRa.setSpreadingFactor(LORA_SPREADING_FACTOR);
    LoRa.setSignalBandwidth(LORA_SIGNAL_BW);
    Serial.println(F("[INIT] LoRa SX1278 transceiver online."));
  } else {
    Serial.println(F("[WARN] LoRa SX1278 initialization failed."));
  }
}

// ============================================================================
// 1. SENSE — Continuous Parameter Sampling
// ============================================================================
void senseParameters() {
  telemetry.timestampMs = millis();

  // Environmental Reading
  if (hasBME280) {
    telemetry.temperatureC = bme.readTemperature();
    telemetry.pressureKPa  = bme.readPressure() / 1000.0f; // Pa to kPa
    telemetry.humidityPct  = bme.readHumidity();
  } else {
    // Fallback safe simulation values if transducer is disconnected
    telemetry.temperatureC = -8.0f;
    telemetry.pressureKPa  = 68.0f;
    telemetry.humidityPct  = 35.0f;
  }

  // Electrical Reading
  if (hasINA219) {
    float busV = ina219.getBusVoltage_V();
    float shuntmV = ina219.getShuntVoltage_mV();
    telemetry.busVoltageV = busV + (shuntmV / 1000.0f);
    telemetry.currentDrawA = ina219.getCurrent_mA() / 1000.0f;
    telemetry.powerWatts   = telemetry.busVoltageV * telemetry.currentDrawA;
  } else {
    telemetry.busVoltageV = 12.10f;
    telemetry.currentDrawA = 1.80f;
    telemetry.powerWatts   = 21.78f;
  }

  // Battery percentage estimate (10.0V = 0%, 12.6V = 100% for 3S Li-ion pack)
  float batt = ((telemetry.busVoltageV - 10.0f) / 2.6f) * 100.0f;
  telemetry.batteryPercent = constrain(batt, 0.0f, 100.0f);

  telemetry.loraConnected = hasLoRa;
  telemetry.sdLoggingActive = hasSD;
}

// ============================================================================
// 2. ANALYZE — Safety Envelopes & Hysteresis State Engine
// ============================================================================
void analyzeConditions() {
  SystemState nextState = STATE_NORMAL;
  strcpy(telemetry.lastFaultCode, "NONE");

  // Check Transducer Failures
  if (!hasBME280 || !hasINA219) {
    nextState = STATE_SENSOR_FAULT;
    strcpy(telemetry.lastFaultCode, "ERR_SENSOR_TIMEOUT");
  }

  // Thermal Protection Logic with Hysteresis
  if (telemetry.temperatureC < THRESHOLD_TEMP_COLD_ON) {
    telemetry.heaterActive = true;
    if (nextState == STATE_NORMAL) nextState = STATE_WARNING;
    strcpy(telemetry.lastFaultCode, "WARN_LOW_TEMP");
  } else if (telemetry.temperatureC > THRESHOLD_TEMP_COLD_OFF) {
    telemetry.heaterActive = false;
  }

  // High Temperature Protection with Hysteresis
  if (telemetry.temperatureC > THRESHOLD_TEMP_HOT_ON) {
    telemetry.fanActive = true;
    if (nextState == STATE_NORMAL) nextState = STATE_WARNING;
    strcpy(telemetry.lastFaultCode, "WARN_HIGH_TEMP");
  } else if (telemetry.temperatureC < THRESHOLD_TEMP_HOT_OFF) {
    telemetry.fanActive = false;
  }

  // Over-Current Trip
  if (telemetry.currentDrawA > THRESHOLD_CURR_MAX) {
    nextState = STATE_CRITICAL;
    strcpy(telemetry.lastFaultCode, "CRIT_OVER_CURRENT");
    telemetry.fanActive = true; // Engage convective cooling
  }

  // Low Battery Cutoff & Load Shedding
  if (telemetry.busVoltageV < THRESHOLD_VOLT_MIN) {
    nextState = STATE_CRITICAL;
    strcpy(telemetry.lastFaultCode, "CRIT_LOW_BATTERY");
    // Shed non-essential thermal load to preserve control system
    telemetry.heaterActive = false;
  }

  telemetry.state = nextState;
}

// ============================================================================
// 3. PROTECT — Dynamic MOSFET Actuation
// ============================================================================
void protectActuators() {
  // Drive Heater MOSFET via PWM
  if (telemetry.heaterActive) {
    ledcWrite(PWM_HEATER_CHANNEL, 220); // 86% PWM Duty for controlled warming
  } else {
    ledcWrite(PWM_HEATER_CHANNEL, 0);
  }

  // Drive Cooling Fan MOSFET via PWM
  if (telemetry.fanActive) {
    ledcWrite(PWM_FAN_CHANNEL, 255);    // 100% full airflow purge
  } else {
    ledcWrite(PWM_FAN_CHANNEL, 0);
  }
}

// ============================================================================
// 4. ALERT — Audiovisual and Display Indicators
// ============================================================================
void alertOutputs() {
  // LED Status Control
  if (telemetry.state == STATE_NORMAL) {
    digitalWrite(PIN_LED_NORMAL, HIGH);
    digitalWrite(PIN_LED_ALERT, LOW);
  } else if (telemetry.state == STATE_WARNING) {
    digitalWrite(PIN_LED_NORMAL, LOW);
    digitalWrite(PIN_LED_ALERT, (millis() / 500) % 2); // Slow blink
  } else { // CRITICAL or SENSOR_FAULT
    digitalWrite(PIN_LED_NORMAL, LOW);
    digitalWrite(PIN_LED_ALERT, (millis() / 150) % 2); // Fast strobe
    // Pulse buzzer alarm during critical breach
    if ((millis() / 300) % 2) {
      triggerBeep(2600, 80);
    }
  }

  // Render to 0.96" OLED Display
  if (hasOLED) {
    display.clearDisplay();

    // Top Header
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.print(F("SHIELD "));
    display.print(getStateString(telemetry.state));

    // Telemetry Grid
    display.setCursor(0, 14);
    display.printf("T:%+.1fC  P:%.1fkPa\n", telemetry.temperatureC, telemetry.pressureKPa);
    display.printf("V:%.2fV   I:%.2fA\n", telemetry.busVoltageV, telemetry.currentDrawA);
    display.printf("Pwr:%.1fW  Bat:%.0f%%\n", telemetry.powerWatts, telemetry.batteryPercent);

    // Actuator Bar
    display.setCursor(0, 52);
    display.printf("HEAT:%s FAN:%s\n", 
      telemetry.heaterActive ? "ON " : "OFF", 
      telemetry.fanActive ? "ON " : "OFF"
    );

    display.display();
  }
}

// ============================================================================
// 5. RECORD — MicroSD Persistence & LoRa Wireless Broadcast
// ============================================================================
void recordData() {
  // Serial Debug Logging
  Serial.println(formatCsvRecord(telemetry));

  // MicroSD Blackbox File Writing
  if (hasSD) {
    if (!logFile) {
      logFile = SD.open("/datalog.csv", FILE_APPEND);
    }
    if (logFile) {
      logFile.println(formatCsvRecord(telemetry));
      if (millis() - lastFlushTime > SD_FLUSH_INTERVAL_MS) {
        logFile.flush();
        lastFlushTime = millis();
      }
    }
  }

  // LoRa RF Telemetry Beacon
  if (hasLoRa && (millis() - lastLoraTime > LORA_BEACON_INTERVAL_MS)) {
    lastLoraTime = millis();
    LoRa.beginPacket();
    LoRa.print(formatLoraPacket(telemetry));
    LoRa.endPacket();
  }
}

// ============================================================================
// MAIN LOOP
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=========================================="));
  Serial.println(F("  LADAKH-SHIELD CONTROLLER INITIALIZING  "));
  Serial.println(F("=========================================="));

  setupActuators();
  setupSensorsAndBuses();

  triggerBeep(2400, 100);
  Serial.println(F("[INIT] System initialization complete. Entering loop."));
}

void loop() {
  unsigned long now = millis();

  if (now - lastSampleTime >= SENSOR_SAMPLE_INTERVAL_MS) {
    lastSampleTime = now;

    // The 5 Core Pillars
    senseParameters();
    analyzeConditions();
    protectActuators();
    alertOutputs();
    recordData();
  }

  // Minimal yield for FreeRTOS background watchdog
  yield();
}
