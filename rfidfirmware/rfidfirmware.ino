/*
 * RFID Node Firmware @copy Koppany Horvath 2018
 * This is the firmware that goes into the RFID nodes
 * for the ARECS project.
 * All code is under the MIT license and comes as is.
 * I assume no responsibility for anything relating to
 * this code.
 */

#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>

//hardware pin config
const int statLed = 2;
const int tone1 = 15;
const int tone2 = 4;
const int RST_PIN = 22;
const int SDA_PIN = 5;

//wifi config
String ssid = "asdfasdf";
String pass = "asdfasdf";

//service config
String site = "192.168.1.123";
uint16_t port = 1234;

WiFiClient client;
MFRC522 mfrc522(SDA_PIN, RST_PIN);
String t;

void notify(int m=0){
  if(m == 0){
    beep(500, 200); //success
    beep(1000, 100);
  } else if(m == 1) beep(10000, 100); //config set
  else if(m == 2){
    for(int i=0; i<50; i++){ //failure
      beep(1000, 10);
      delay(10);
    }
  }
}

void setup() {
  pinMode(statLed, OUTPUT);
  pinMode(tone1, OUTPUT);
  pinMode(tone2, OUTPUT);
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  
  Serial.println("");
  Serial.println("ARECS RFID Node V1");
  notify(1);

  if(!connectWifi()) SOS();
  if(!client.connect(site.c_str(), port)){
    Serial.println("Server connection failed!");
    notify(2);
    SOS();
  }
}

void loop() {
  if(mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()){
    for(int i=0; i<10; i++){
      Serial.print((int)mfrc522.uid.uidByte[i]);
      Serial.print(" ");
      client.print((int)mfrc522.uid.uidByte[i]);
      client.print(" ");
    }
    Serial.println("");
    client.println("");
    digitalWrite(statLed, LOW);
    notify();
    digitalWrite(statLed, HIGH);
    mfrc522.PICC_HaltA();
  }
  
  if(!client.connected()){
    Serial.println("");
    Serial.println("Server has disconnected!");
    notify(2);
    SOS();
  }
  if(client.available()){
    t = client.readString();
    t.trim();
    if(t.equals("exit")){
      Serial.println("Session terminated!");
      client.stop();
      notify(2);
      SOS();
    }
    Serial.println(t);
    client.println(t);
  }
}

bool connectWifi(){
  Serial.print("Connecting to WiFi: ");
  Serial.print(ssid);
  digitalWrite(statLed, HIGH);
  int count = 0;
  WiFi.begin(ssid.c_str(), pass.c_str());
  while(WiFi.status() != WL_CONNECTED){
    digitalWrite(statLed, LOW);
    delay(500);
    digitalWrite(statLed, HIGH);
    delay(500);
    Serial.print('.');
    count++;
    if(count >= 60){
      return false;
      Serial.println("");
      Serial.println("WiFi connection failed!");
    }
  }
  Serial.println("");
  Serial.print("Connected with IP ");
  Serial.println(WiFi.localIP());
  return true;
}

void SOS(){
  digitalWrite(statLed, LOW);
  delay(3000);
  int one[9] = {1,1,1,3,3,3,1,1,1};
  int two[9] = {1,1,1,1,1,1,1,1,10};
  while(true){
    for(int i=0; i<9; i++){
      digitalWrite(statLed, HIGH);
      delay(100*one[i]);
      digitalWrite(statLed, LOW);
      delay(100*two[i]);
    }
  }
}

void beep(int freq, int len){
  freq >>= 1;
  for(int i=0; i<len; i++){ //push-pull arrangement
    digitalWrite(tone1, HIGH);
    digitalWrite(tone2, LOW);
    delayMicroseconds(freq);
    digitalWrite(tone1, LOW);
    digitalWrite(tone2, HIGH);
    delayMicroseconds(freq);
  }
  digitalWrite(tone1, LOW);
  digitalWrite(tone2, LOW);
}
