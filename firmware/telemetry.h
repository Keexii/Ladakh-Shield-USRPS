/**
 * LADAKH-SHIELD — Telemetry Data Structures & State Definitions
 */

#ifndef TELEMETRY_H
#define TELEMETRY_H

#include <Arduino.h>

// Operational State Enum
enum SystemState {
  STATE_NORMAL,
  STATE_WARNING,
  STATE_CRITICAL,
  STATE_SENSOR_FAULT
};

// Telemetry Snapshot Struct
struct TelemetryData {
  unsigned long timestampMs;
  float temperatureC;     // BME280 (°C)
  float pressureKPa;      // BME280 (kPa)
  float humidityPct;      // BME280 (%)
  float busVoltageV;      // INA219 (V)
  float currentDrawA;     // INA219 (A)
  float powerWatts;       // INA219 (W)
  float batteryPercent;   // Estimated % based on pack discharge curve
  
  bool heaterActive;      // MOSFET 1 State
  bool fanActive;         // MOSFET 2 State
  bool loraConnected;     // SX1278 Link Status
  bool sdLoggingActive;   // MicroSD Status
  
  SystemState state;
  char lastFaultCode[32];
};

// Helper to convert state to string
inline const char* getStateString(SystemState state) {
  switch (state) {
    case STATE_NORMAL:       return "NORMAL";
    case STATE_WARNING:      return "WARNING";
    case STATE_CRITICAL:     return "CRITICAL";
    case STATE_SENSOR_FAULT: return "SENSOR_FAULT";
    default:                 return "UNKNOWN";
  }
}

// Format CSV string for MicroSD logging
inline String formatCsvRecord(const TelemetryData &d) {
  String row = "";
  row += String(d.timestampMs) + ",";
  row += String(d.temperatureC, 2) + ",";
  row += String(d.pressureKPa, 2) + ",";
  row += String(d.humidityPct, 1) + ",";
  row += String(d.busVoltageV, 2) + ",";
  row += String(d.currentDrawA, 2) + ",";
  row += String(d.powerWatts, 2) + ",";
  row += String(d.batteryPercent, 1) + ",";
  row += String(d.heaterActive ? 1 : 0) + ",";
  row += String(d.fanActive ? 1 : 0) + ",";
  row += String(getStateString(d.state)) + ",";
  row += String(d.lastFaultCode);
  return row;
}

// Format compact packet for LoRa RF transmission
inline String formatLoraPacket(const TelemetryData &d) {
  char buf[96];
  snprintf(buf, sizeof(buf), 
    "$LS,T:%.1f,P:%.1f,H:%.0f,V:%.2f,I:%.2f,W:%.1f,H:%d,F:%d,S:%s*",
    d.temperatureC, d.pressureKPa, d.humidityPct,
    d.busVoltageV, d.currentDrawA, d.powerWatts,
    d.heaterActive ? 1 : 0, d.fanActive ? 1 : 0,
    getStateString(d.state)
  );
  return String(buf);
}

#endif // TELEMETRY_H
