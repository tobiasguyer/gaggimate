#include "Max31855Thermocouple.h"
#include <Arduino.h>
#include <SPI.h>
#include <freertos/FreeRTOS.h>

Max31855Thermocouple::Max31855Thermocouple(const int csPin, const int misoPin, const int sckPin,
                                           const temperature_callback_t &callback,
                                           const temperature_error_callback_t &error_callback)
    : taskHandle(nullptr), csPin(csPin), misoPin(misoPin), sckPin(sckPin) {
    max31855 = new MAX31855(csPin, misoPin, sckPin);
    max31865 = new MAX31865;
    this->callback = callback;
    this->error_callback = error_callback;
}

float Max31855Thermocouple::read() { return isErrorState() ? 0.0f : temperature; }
float Max31855Thermocouple::read2() { return isErrorState() ? 0.0f : temp2; }

bool Max31855Thermocouple::isErrorState() { return temperature <= 0 || errorCount >= MAX31855_MAX_ERRORS; }

void Max31855Thermocouple::setup() {
    SPI.begin();
    vspi = new SPIClass(FSPI);
    vspi->begin(17,18,44);
    pinMode(csPin, OUTPUT);
    pinMode(39, OUTPUT);
    digitalWrite(csPin, HIGH);
    max31865->begin(39, RTD_3_WIRE, RTD_TYPE_PT100, *vspi);
  max31865->setLowFaultTemperature(20);  // Set the low fault threshold to 30 degrees C
  max31865->setHighFaultTemperature(200); // Set the high fault threshold to 70 degrees C
    max31855->begin();
    max31855->setSPIspeed(1000000);

    xTaskCreate(monitorTask, "Max31855Thermocouple::monitor", configMINIMAL_STACK_SIZE * 4, this, 1, &taskHandle);
}

void Max31855Thermocouple::loop() {
    if (errorCount >= MAX31855_MAX_ERRORS || temperature > MAX_SAFE_TEMP) {
        ESP_LOGE(LOG_TAG, "Thermocouple failure! Error Count: %d, Temperature: %.2f\n", errorCount, temperature);
        error_callback();
        return;
    }
    // If buffer has been filled up, remove the previous result from the error count
    if (resultCount == MAX31855_ERROR_WINDOW) {
        errorCount -= resultBuffer[bufferIndex];
    } else {
        ++resultCount;
    }

    float temp;
    int status = max31855->read();
    if (status != STATUS_OK) {
        ESP_LOGE(LOG_TAG, "Failed to read temperature: %d\n", status);
        temp = 0.0f;
    } else {
        temp = max31855->getTemperature();
    }

    if (temp <= 0.0f) {
        ESP_LOGE(LOG_TAG, "Temperature reported below 0°C: %.2f\n", temp);
    }

    resultBuffer[bufferIndex] = temp <= 0.0f ? 1 : 0;
    errorCount += resultBuffer[bufferIndex];
    bufferIndex = (bufferIndex + 1) % MAX31855_ERROR_WINDOW;

    if (temp <= 0.0f)
        return;
    temperature = boilerLowPass * temp + (1.0f - boilerLowPass) * temperature;
    ESP_LOGV(LOG_TAG, "Updated temperature: %2f\n", temperature);
    max31865->sample();
    temp = max31865->getTemperature();
    if(temp >= 0.1f) {
        temp2 = temp * groupLowPass + temp2 * (1.0f - groupLowPass);
    }
    ESP_LOGV(LOG_TAG, "Updated temperature2: %2f\n", temp2);
    callback(temperature);
}

[[noreturn]] void Max31855Thermocouple::monitorTask(void *arg) {
    TickType_t lastWake = xTaskGetTickCount();
    auto *thermocouple = static_cast<Max31855Thermocouple *>(arg);
    while (true) {
        thermocouple->loop();
        xTaskDelayUntil(&lastWake, pdMS_TO_TICKS(MAX31855_UPDATE_INTERVAL));
    }
}
