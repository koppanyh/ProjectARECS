/*
 * RFID Node Firmware @copy Koppany Horvath 2018
 * This is the firmware that goes into the RFID nodes
 * for the ARECS project.
 * All code is under the MIT license and comes as is.
 * I assume no responsibility for anything relating to this code.
 */

#include <WiFi.h>

//char ssid[33] = "asdfasfd";
//char pass[65] = "asdfasdf";
//char site[128] = "192.168.1.10";
String ssid = "asdfsdf";
String pass = "asdfasdf";
String site = "8.8.88.8";
uint16_t port = 1234;
const int statLed = 2;
WiFiClient client;
String t;

void setup() {
  Serial.begin(115200);
  pinMode(statLed, OUTPUT);
  Serial.println("");
  Serial.println("ARECS RFID Node V1");

  if(!connectWifi()) SOS();

  if(!client.connect(site.c_str(), port)){
    Serial.println("Server connection failed!");
    SOS();
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

void loop() {
  if(!client.connected()){
    Serial.println("");
    Serial.println("Server has disconnected!");
    SOS();
  }
  if(client.available()){
    t = client.readString();
    t.trim();
    if(t.equals("exit")){
      Serial.println("Session terminated!");
      client.stop();
      SOS();
    }
    Serial.println(t);
    client.println(t);
  }
}
