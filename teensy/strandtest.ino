#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

#define PIN 2
#define BIT0 17
#define BIT1 16
#define BIT2 15
#define BIT3 14

int oldnum = 0;
// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
//   NEO_RGBW    Pixels are wired for RGBW bitstream (NeoPixel RGBW products)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(16, PIN, NEO_GRB + NEO_KHZ800);

// IMPORTANT: To reduce NeoPixel burnout risk, add 1000 uF capacitor across
// pixel power leads, add 300 - 500 Ohm resistor on first pixel's data input
// and minimize distance between Arduino and first pixel.  Avoid connecting
// on a live circuit...if you must, connect GND first.

void setup() {
  pinMode(BIT0, INPUT);
  pinMode(BIT1, INPUT);
  pinMode(BIT2, INPUT);
  pinMode(BIT3, INPUT);

  strip.setBrightness(50);

  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
  Serial.begin(9600);
  america();
}

void loop() {
  int stat = 0;
//    int di0 = digitalRead(BIT0);
    Serial.print(digitalRead(BIT0));
    Serial.print("\t");
    Serial.print(digitalRead(BIT1));
    Serial.print("\t");
    Serial.print(digitalRead(BIT2));
    Serial.print("\t");
    Serial.print(digitalRead(BIT3));
    Serial.print("\t");
  if (digitalRead(BIT0)) stat += 1;
  if (digitalRead(BIT1)) stat += 2;
  if (digitalRead(BIT2)) stat += 4;
  if (digitalRead(BIT3)) stat += 8;
  Serial.print(stat);
  Serial.print("\t");
  Serial.println(oldnum);

  if (stat != oldnum || stat == 2 || stat == 3) {
    oldnum = stat;
    switch (stat) {
      case 0:
        //Broken
        setColour(0);
        break;
      case 1:
        //Done
        setColour(1);
        break;
      case 2:
        //Working
        colorWipe2(strip.Color(0, 0, 255), 50);
        //        colorWipe(strip.Color(0, 0, 0), 50);
        Serial.print("Hello");
        break;
      case 3:
        theaterChase(strip.Color(243, 156, 18), 20);
        break;
      default:
        //Off
        setColour(3);
        break;
    }
  }
  //  delay(500);
}

void setColour(int num) {
  uint32_t c;
  switch (num) {
    case 0:
      c = strip.Color(255, 0, 0);
      for (uint16_t i = 0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
      }
      break;
    case 1:
      c = strip.Color(0, 255, 0);
      for (uint16_t i = 0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
      }
      break;
    case 2:
      c = strip.Color(0, 0, 255);
      for (uint16_t i = 0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
      }
      break;
    case 3:
      c = strip.Color(0, 0, 0);
      for (uint16_t i = 0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
      }
      break;
  }
  strip.show();
  delay(10);
}

// Fill the dots one after the other with a color
void colorWipe(uint32_t c, uint8_t wait) {
  for (uint16_t i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }
}

void colorWipe2(uint32_t c, uint8_t wait) {
  Serial.print("Goodby");
  uint32_t d = strip.Color(0, 0, 0);
  strip.setPixelColor(0, c);
  strip.show();
  delay(wait);
  for (uint16_t i = 1; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.setPixelColor(i - 1, d);
    strip.show();
    delay(wait);
  }
  strip.setPixelColor(15, d);
  strip.show();
  delay(wait);
}

void america() {
  int c = strip.Color(255, 0, 0);
  for (uint16_t i = 0; i < 5; i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(50);
  }
  c = strip.Color(255, 255, 255);
  for (uint16_t i = 5; i < 10; i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(50);
  }
  c = strip.Color(0, 0, 255);
  for (uint16_t i = 10; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(50);
  }
  delay(2000);
}

void rainbow(uint8_t wait) {
  uint16_t i, j;

  for (j = 0; j < 256; j++) {
    for (i = 0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i, Wheel((i + j) & 255));
    }
    strip.show();
    delay(wait);
  }
}

// Slightly different, this makes the rainbow equally distributed throughout
void rainbowCycle(uint8_t wait) {
  uint16_t i, j;

  for (j = 0; j < 256 * 5; j++) { // 5 cycles of all colors on wheel
    for (i = 0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
    }
    strip.show();
    delay(wait);
  }
}

//Theatre-style crawling lights.
void theaterChase(uint32_t c, uint8_t wait) {
  for (int j = 0; j < 10; j++) { //do 10 cycles of chasing
    for (int q = 0; q < 3; q++) {
      for (uint16_t i = 0; i < strip.numPixels(); i = i + 3) {
        strip.setPixelColor(i + q, c);  //turn every third pixel on
      }
      strip.show();

      delay(wait);

      for (uint16_t i = 0; i < strip.numPixels(); i = i + 3) {
        strip.setPixelColor(i + q, 0);      //turn every third pixel off
      }
    }
  }
}

//Theatre-style crawling lights with rainbow effect
void theaterChaseRainbow(uint8_t wait) {
  for (int j = 0; j < 256; j++) {   // cycle all 256 colors in the wheel
    for (int q = 0; q < 3; q++) {
      for (uint16_t i = 0; i < strip.numPixels(); i = i + 3) {
        strip.setPixelColor(i + q, Wheel( (i + j) % 255)); //turn every third pixel on
      }
      strip.show();

      delay(wait);

      for (uint16_t i = 0; i < strip.numPixels(); i = i + 3) {
        strip.setPixelColor(i + q, 0);      //turn every third pixel off
      }
    }
  }
}

// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if (WheelPos < 85) {
    return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if (WheelPos < 170) {
    WheelPos -= 85;
    return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}
