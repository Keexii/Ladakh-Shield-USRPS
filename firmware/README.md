# LADAKH-SHIELD Embedded Firmware (`src/`)

This directory contains the production-grade embedded C++ firmware for the **LADAKH-SHIELD** central controller.

## 📁 Source Files
- **[`main.cpp`](main.cpp)**: Core operational loop implementing the 5-pillar pipeline:
  `senseParameters()` → `analyzeConditions()` → `protectActuators()` → `alertOutputs()` → `recordData()`.
- **[`config.h`](config.h)**: System pin assignments, I2C/SPI bus addresses, PWM channel allocations, and hysteresis threshold constants.
- **[`telemetry.h`](telemetry.h)**: Real-time telemetry snapshot structures, system state machine enums, and CSV / LoRa packet serializers.

---

## 🔌 Hardware Pinout Connection Matrix

| Peripheral | Sensor / Module | ESP32 Pin | Interface / Protocol |
| :--- | :--- | :--- | :--- |
| **Environmental** | Bosch BME280 | GPIO 21 (SDA), GPIO 22 (SCL) | I2C (Address `0x76`) |
| **Power Monitor** | TI INA219 / INA226 | GPIO 21 (SDA), GPIO 22 (SCL) | I2C (Address `0x40`) |
| **Local Display** | 0.96" SSD1306 OLED | GPIO 21 (SDA), GPIO 22 (SCL) | I2C (Address `0x3C`) |
| **RF Wireless** | Semtech LoRa SX1278 | SCK: 18, MISO: 19, MOSI: 23, CS: 15, RST: 14, DIO0: 26 | SPI Bus (`868 MHz` / `433 MHz`) |
| **Blackbox Logger**| MicroSD Module | SCK: 18, MISO: 19, MOSI: 23, CS: 5 | SPI Bus (FAT32 filesystem) |
| **Thermal Actuator**| 12V PTC Heating Pad | GPIO 25 | N-Channel MOSFET (LEDC PWM Ch 0) |
| **Cooling Actuator**| 5V/12V Exhaust Fan | GPIO 27 | N-Channel MOSFET (LEDC PWM Ch 1) |
| **Status LEDs** | Green / Red Duo | Green: GPIO 12, Red: GPIO 13 | Digital Output |
| **Piezo Alarm** | 85dB Buzzer | GPIO 4 | PWM Frequency Generator |

---

## 📦 Required Libraries

Install the following libraries via **Arduino Library Manager** or add them to your **`platformio.ini`**:
- `Adafruit BME280 Library` by Adafruit (v2.2.2+)
- `Adafruit INA219` by Adafruit (v1.2.1+)
- `Adafruit SSD1306` by Adafruit (v2.5.7+)
- `Adafruit GFX Library` by Adafruit (v1.11.5+)
- `LoRa` by Sandeep Mistry (v0.8.0+)
- `SD` (Included with ESP32 Arduino Core)

---

## 🚀 How to Build & Flash

### Option A: Using PlatformIO (VS Code)
Create a `platformio.ini` in the project root:
```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
    adafruit/Adafruit BME280 Library
    adafruit/Adafruit INA219
    adafruit/Adafruit SSD1306
    adafruit/Adafruit GFX Library
    sandeepmistry/LoRa
```
Run:
```bash
pio run -t upload
pio device monitor -b 115200
```

### Option B: Using Arduino IDE
1. Open Arduino IDE and select board **"DOIT ESP32 DEVKIT V1"** (or generic **ESP32 Dev Module**).
2. Open `src/main.cpp` (you can rename to `src.ino` or load via sketch).
3. Connect ESP32 via Micro-USB / USB-C cable and choose the COM port.
4. Click **Upload** (Ctrl + U).
5. Open Serial Monitor at **115200 baud** to observe live startup calibration and telemetry streaming.
