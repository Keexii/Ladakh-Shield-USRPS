/**
 * LADAKH-SHIELD — System Hardware Configuration & Pinout Header
 * Target MCU: ESP32 NodeMCU / Custom WROOM-32 PCB
 */

#ifndef CONFIG_H
#define CONFIG_H

// ============================================================================
// I2C BUS DEFINITIONS (BME280, INA219, OLED SSD1306)
// ============================================================================
#define I2C_SDA_PIN              21
#define I2C_SCL_PIN              22
#define I2C_FREQ_HZ              400000

#define ADDR_BME280              0x76   // Default Bosch BME280 I2C address
#define ADDR_INA219              0x40   // Default TI INA219 high-side shunt
#define ADDR_OLED                0x3C   // 0.96" 128x64 I2C SSD1306 display

// ============================================================================
// SPI BUS DEFINITIONS (LoRa SX1278 & MicroSD Module)
// ============================================================================
#define SPI_SCK_PIN              18
#define SPI_MISO_PIN             19
#define SPI_MOSI_PIN             23

// MicroSD SPI Chip Select
#define SD_CS_PIN                5

// LoRa SX1278 SPI Pins
#define LORA_CS_PIN              15
#define LORA_RST_PIN             14
#define LORA_DIO0_PIN            26
#define LORA_BAND_HZ             868E6  // 868MHz (or 433E6 / 915E6 depending on region)
#define LORA_TX_POWER            17     // dBm (2 to 20)
#define LORA_SPREADING_FACTOR    7      // SF7 to SF12
#define LORA_SIGNAL_BW           125E3  // 125 kHz bandwidth

// ============================================================================
// PROTECTION ACTUATORS & MOSFET PINS
// ============================================================================
#define PIN_MOSFET_HEATER        25     // PWM / Digital Output to 12V PTC Heater Pad
#define PIN_MOSFET_FAN           27     // PWM / Digital Output to Brushless Exhaust Fan

// PWM Channel Settings (ESP32 LEDC peripheral)
#define PWM_HEATER_CHANNEL       0
#define PWM_FAN_CHANNEL          1
#define PWM_FREQ_HZ              5000
#define PWM_RESOLUTION_BITS      8      // 0 to 255 duty cycle

// ============================================================================
// LOCAL AUDIBLE & VISUAL ALERT PINS
// ============================================================================
#define PIN_LED_NORMAL           12     // Green Status LED
#define PIN_LED_ALERT            13     // Red Alert LED
#define PIN_BUZZER               4      // 85dB Active/Passive Piezo Sounder
#define BUZZER_PWM_CHANNEL       2

// ============================================================================
// SYSTEM OPERATING THRESHOLDS & HYSTERESIS ENVELOPES
// ============================================================================
// Thermal limits
#define THRESHOLD_TEMP_COLD_ON   -15.0f // Turn heater ON below -15°C
#define THRESHOLD_TEMP_COLD_OFF  -5.0f  // Turn heater OFF above -5°C (10°C hysteresis)
#define THRESHOLD_TEMP_HOT_ON    45.0f  // Turn cooling fan ON above +45°C
#define THRESHOLD_TEMP_HOT_OFF   38.0f  // Turn cooling fan OFF below +38°C (7°C hysteresis)

// Electrical limits
#define THRESHOLD_VOLT_MIN       10.2f  // Critical low-battery voltage (12V pack cutoff)
#define THRESHOLD_VOLT_RECOVER   11.0f  // Low-battery recovery voltage
#define THRESHOLD_CURR_MAX       4.50f  // Over-current trip threshold (Amperes)
#define SHUNT_RESISTOR_OHMS      0.1f   // INA219 Shunt resistor value

// Telemetry Polling Frequencies
#define SENSOR_SAMPLE_INTERVAL_MS 1000   // Sample sensors every 1.0 second
#define LORA_BEACON_INTERVAL_MS   3000   // Transmit LoRa packet every 3.0 seconds
#define SD_FLUSH_INTERVAL_MS      5000   // Flush MicroSD file buffer every 5.0 seconds

#endif // CONFIG_H
