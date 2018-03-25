/*
 * RFID Node Firmware @copy Koppany Horvath 2018
 * This is the firmware that goes into the RFID nodes
 * for the ARECS project.
 * All code is under the MIT license and comes as is.
 * I assume no responsibility for anything relating to
 * this code.
 */

/*
 * TODO
 * occasionally poll server for time to stay in sync
 * be able to get date time strings accurate to 1 minute
 * implement buffer for datas that didn't make it to server
 * implement way to reconnect to wifi/server if not working
 */

#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <FS.h>
#include <AsyncTCP.h>          //https://github.com/me-no-dev/AsyncTCP
#include <ESPAsyncWebServer.h> //https://github.com/me-no-dev/ESPAsyncWebServer
#include <DNSServer.h>
#include <Preferences.h>

//hardware pin config
const int statLed = 2;
const int tone1 = 15;
const int tone2 = 4;
const int RST_PIN = 22;
const int SDA_PIN = 5;
const int configPin = 25;
const int apIdPins[4] = {32, 33, 34, 35};

//wifi config
String ssid = "asdfasdf";
String pass = "asdfasdf";

//service config
String site = "192.168.1.123";
uint16_t port = 1234;
String siteport = "192.168.1.123:1234";

//other stuff
AsyncWebServer server(80);
DNSServer dnsServer;
Preferences configs;
MFRC522 mfrc522(SDA_PIN, RST_PIN);
const char hexcodes[16] = {'0','1','2','3','4','5','6','7',
  '8','9','A','B','C','D','E','F'};
bool isConfig = false;
int counter = 0;
bool ledOn = false;

//configuration page html
const char index_html1[] PROGMEM =
  "<!DOCTYPE HTML>\n"
  "<html>\n"
  "  <head>\n"
  "    <title>ARECS Configuration</title>\n"
  "    <meta charset=\"utf-8\">\n"
  "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
  "  </head>\n"
  "  <body>\n"
  "  <b>ARECS Configuration Page</b><br><br>\n"
  "  Node Identifier: ";
char uuid[13];
const char index_html2[] PROGMEM =
  "<br><br>\n"
  "  <form action=\"/configure\" method=\"POST\">\n"
  "    Select Wifi Network<br>\n"
  "    <select id=\"ssids\" name=\"ssid\">\n"
  "      <option value=\"SSID 1\">Loading SSIDS...</option>\n"
  "    </select><br><br>\n"
  "    Type in WiFi Password<br>\n"
  "    <input type=\"password\" name=\"pass\"><br>\n"
  "    Confirm WiFi Password<br>\n"
  "    <input type=\"password\" name=\"ssap\"><br><br>\n"
  "    Service Address<br>\n"
  "    <input type=\"text\" name=\"serv\"><br>\n"
  "    Service Port<br>\n"
  "    <input type=\"number\" name=\"port\" value=\"8080\"><br><br>\n"
  "    <input type=\"submit\" value=\"Save Configuration\">\n"
  "  </form>\n"
  "  </body>\n"
  "</html>\n"
  "<script>\n"
  "  function getssids(){\n"
  "    var http = new XMLHttpRequest();\n"
  "    http.open(\"GET\", \"/getssids\", true);\n"
  "    http.onreadystatechange = function(){\n"
  "      if(http.readyState == 4 && http.status == 200){\n"
  "        var ssids = document.getElementById(\"ssids\");\n"
  "        for(var i=ssids.length; i>=0; i--) ssids.remove(i);\n"
  "        http.responseText.split(\":::::\").forEach(function(itm){\n"
  "          var c = document.createElement(\"option\");\n"
  "          c.text = itm;\n"
  "          c.value = itm;\n"
  "          ssids.add(c);\n"
  "        });\n"
  "      }\n"
  "    };\n"
  "    http.send();\n"
  "  }\n"
  "  try{ getssids(); } catch(e){ alert(e); }\n"
  "</script>\n";

//various noises for status
void notify(int m=0){
  if(m == 0){
    beep(500, 200); //success
    beep(1000, 100);
  } else if(m == 1) beep(10000, 100); //node start
  else if(m == 2){
    for(int i=0; i<50; i++){ //failure
      beep(1000, 10);
      delay(10);
    }
  } else if(m == 3){
    beep(1000, 125); //access point activated
    beep(500, 250);
    beep(333, 375);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(statLed, OUTPUT);
  pinMode(tone1, OUTPUT);
  pinMode(tone2, OUTPUT);
  pinMode(configPin, INPUT);
  for(int i=0; i<4; i++) pinMode(apIdPins[i], INPUT);
  Serial.println();
  Serial.println("ARECS RFID Node V1 by KH-Labs");

  //get chip UUID
  uint64_t chipid = ESP.getEfuseMac();
  char uuidtmp[] = "%04X%08X";
  sprintf(uuid, uuidtmp, (uint16_t)(chipid>>32), (uint32_t)chipid);

  //check which mode to be in
  configs.begin("wificreds", true);
  isConfig = configs.getBool("isConfig");
  configs.end();

  //let the user know it booted up
  notify(1);

  if(isConfig){
    Serial.println("Mode: AP Config");

    //get hex from dip switch for unique ssid
    uint8_t v = 0;
    for(int i=3; i>=0; i--){
      bool a = digitalRead(apIdPins[i]);
      Serial.print(a);
      Serial.print(" ");
      v <<= 1;
      if(a) v |= 1;
    }
    Serial.print((int)v);
    Serial.print(" ");
    Serial.println(hexcodes[v]);

    //generate ssid and password based on dip switch
    ssid = "ARECS_Node_";
    ssid += hexcodes[v];
    pass = "password";
    pass += hexcodes[v];

    //activate AP mode with generated ssid and password
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ssid.c_str(), pass.c_str());
    delay(1000);
    IPAddress apIP(192, 168, 1, 1);
    WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
    Serial.print("IP Addr: ");
    Serial.println(WiFi.softAPIP());

    //serve code for config page
    server.on("/", HTTP_GET, [](AsyncWebServerRequest* request){
      Serial.print("Connection made: ");
      Serial.println(request->url());
      
      AsyncResponseStream* response = request->beginResponseStream("text/html");
      response->print(index_html1);
      response->print(uuid);
      response->print(index_html2);
      
      request->send(response);
    });

    //api call to get available ssids for config form
    server.on("/getssids", HTTP_GET, [](AsyncWebServerRequest* request){
      request->send(200, "text/plain", getSSID());
    });

    //api call to apply settings from config form
    server.on("/configure", HTTP_POST, [](AsyncWebServerRequest* request){
      bool failure = false;
      configs.begin("wificreds", false);

      //apply wifi settings, skip if both passwords are blank
      if(request->hasParam("ssid", true) && request->hasParam("pass", true) && request->hasParam("ssap", true)){
        AsyncWebParameter* p;
        AsyncWebParameter* q;
        p = request->getParam("pass", true);
        q = request->getParam("ssap", true);
        if(p->value() == "" && p->value() == "") Serial.println("Skip WiFi Settings");
        else{
          if(p->value() == q->value()){
            AsyncWebParameter* r = request->getParam("ssid", true);
            configs.putString("ssid", r->value());
            configs.putString("pass", p->value());
          } else{
            Serial.println("Passwords not matching");
            failure = true;
          }
        }
      }

      //apply service settings, skip if address is blank
      if(request->hasParam("serv", true) && request->hasParam("port", true)){
          AsyncWebParameter* s = request->getParam("serv", true);
          if(s->value() != ""){
            AsyncWebParameter* t = request->getParam("port", true);
            configs.putString("server", s->value());
            configs.putUShort("port", (uint16_t)(t->value().toInt()));
          } else Serial.println("Skip Server Settings");
      }

      //disable access point config mode
      if(!failure) configs.putBool("isConfig", false);
      
      configs.end();

      if(failure) request->redirect("/");
      else request->send(200, "text/html",
        "<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
        "<a href=\"/restart\">Restart to apply changes</a>\n"
      );
    });

    //api call to restart the node to use the settings
    server.on("/restart", HTTP_GET, [](AsyncWebServerRequest* request){
      request->send(200, "text/html", "<h1>Goodbye</h1>");
      Serial.println("Restarting...");
      ESP.restart();
    });

    //go to config form if the url is random
    server.onNotFound([](AsyncWebServerRequest* request){ request->redirect("/"); });

    //start http and dns servers
    dnsServer.start(53, "*", apIP);
    server.begin();

    //let the user know that the access point is ready
    notify(3);
  }
  /////////////////////////////////////////////////////////////
  else{
    Serial.println("Mode: Node");

    //init the rfid reader
    SPI.begin();
    mfrc522.PCD_Init();

    //get the saved settings for wifi and service
    configs.begin("wificreds", false);
    ssid = configs.getString("ssid");
    pass = configs.getString("pass");
    site = configs.getString("server");
    port = configs.getUShort("port");
    configs.end();

    siteport = site + ":" + String(port);

    //connect to wifi, error if not
    if(!connectWifi()) SOS();

    //beep a second time to let the user know that it's ready for rfid
    notify(1);
  }
}

void loop() {
  //code for configuration mode
  if(isConfig){
    //process dns requests
    dnsServer.processNextRequest();

    //blink the light slowly to indicate access point config mode, non-blocking
    counter++;
    if(counter > 100000){
      counter = 0;
      ledOn = !ledOn;
      digitalWrite(statLed, ledOn);
    }
  }
  //code for normal operation
  else{
    //check if the config button has been pressed
    configButton();

    //read the rfid card and send data to server
    if(mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()){
      String cid = "";
      for(int i=0; i<10; i++){
        Serial.print((int)mfrc522.uid.uidByte[i]);
        Serial.print(" ");
        //client.print((int)mfrc522.uid.uidByte[i]);
        //client.print(" ");
        cid += hexcodes[((mfrc522.uid.uidByte[i]) >> 4) & 0x0f];
        cid += hexcodes[(mfrc522.uid.uidByte[i]) & 0x0f];
      }
      Serial.println();
      Serial.println(cid);
      //client.println("");
      digitalWrite(statLed, LOW);
      notify();
      sendrfid(cid);
      digitalWrite(statLed, HIGH);
      mfrc522.PICC_HaltA();
    }
  }
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
bool sendrfid(String id){
  WiFiClient client;

  //connect to the server, error if not
  if(!client.connect(site.c_str(), port)){
    // !!!!!!!!!!!!!!!!!!!! put this in a buffer instead !!!!!!!!!!!!!!!!!!!!
    Serial.println("Server connection failed!");
    notify(2);
    SOS();
  } else{
    client.print("POST /rfidevent HTTP/1.1\r\nHost: ");
    client.print(siteport); //"localhost:8080"
    client.print(
      "\r\n"
      "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0\r\n"
      "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n"
      "Accept-Language: en-US,en;q=0.5\r\n"
      "Accept-Encoding: gzip, deflate\r\n"
      "Content-Type: application/x-www-form-urlencoded\r\n"
      "Content-Length: 63\r\n"
      "Connection: keep-alive\r\n"
      "Upgrade-Insecure-Requests: 1\r\n"
      "\r\n"
      "node=");
    client.print(uuid);
    client.print("&time=2018-03-24-13-28&id=");
    client.print(id);
    //node=001122334455&time=2018-03-24-13-28&id=00112233445566778899

    //check if the server agrees, wait 10 seconds
    for(int i=0; i<100; i++){
      if(client.available()) break;
      delay(100);
    }
    String t = client.readString();
    if(t.indexOf("success") == -1) notify(2);
  }
  
  client.stop();
  
  //if the server disconnects then error
  //if(!client.connected()){

  //read data from server and echo it back
  //if(client.available()){
  //  String t = client.readString();
  //    client.stop();
  //  client.println(t);
  
  return true;
}

//helper function to connect to wifi
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

//activates config mode if button is pressed
void configButton(){
  if(digitalRead(configPin)){
    configs.begin("wificreds", false);
    configs.putBool("isConfig", true);
    configs.end();
    for(int i=0; i<2; i++){
      notify(1);
      delay(1000);
    }
    ESP.restart();
  }
}

//flashes the light to indicate error
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
    configButton();
  }
  // !!!!!!!!!!!!!!!!!!!!!! try to get connected back up !!!!!!!!!!!!!!!!!!!!!
}

//generates a tone, used for status noises
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

//returns a list of scanned ssids for the configuration form
String getSSID(){
  String resp = "";
  int n = WiFi.scanNetworks();
  for(int i=0; i<n; i++){
    resp += WiFi.SSID(i);
    resp += ":::::";
  }
  return resp;
}
