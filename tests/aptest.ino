#include <WiFi.h>
#include <FS.h>
#include <AsyncTCP.h>          //https://github.com/me-no-dev/AsyncTCP
#include <ESPAsyncWebServer.h> //https://github.com/me-no-dev/ESPAsyncWebServer
#include <DNSServer.h>
#include <Preferences.h>

String ssid = "ARECS_Node_1";
String password = "password1";

IPAddress apIP(192, 168, 1, 1);
DNSServer dnsServer;
AsyncWebServer server(80);

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
  "      <option value=\"SSID 2\">SSID 2</option>\n"
  "    </select><br><br>\n"
  "    Type in WiFi Password<br>\n"
  "    <input type=\"password\" name=\"pass\"><br><br>\n"
  "    Confirm WiFi Password<br>\n"
  "    <input type=\"password\" name=\"ssap\"><br><br>\n"
  "    <input type=\"submit\" value=\"Save and Reboot\">\n"
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

Preferences configs;

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid.c_str(), password.c_str());
  delay(100);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  
  Serial.println("");
  Serial.print("IP Addr: ");
  Serial.println(WiFi.softAPIP());

  uint64_t chipid = ESP.getEfuseMac();
  char uuidtmp[] = "%04X%08X";
  sprintf(uuid, uuidtmp, (uint16_t)(chipid>>32), (uint32_t)chipid);

  configs.begin("wificreds", false);
  Serial.print("SSID: ");
  Serial.println(configs.getString("ssid"));
  Serial.print("Password: ");
  Serial.println(configs.getString("pass"));
  configs.end();

  server.on("/", HTTP_GET, [](AsyncWebServerRequest* request){
    Serial.print("Connection made: ");
    Serial.println(request->url());
    
    AsyncResponseStream* response = request->beginResponseStream("text/html");
    response->print(index_html1);
    response->print(uuid);
    response->print(index_html2);
    
    request->send(response);
  });

  server.on("/getssids", HTTP_GET, [](AsyncWebServerRequest* request){
    request->send(200, "text/plain", getSSID());
  });

  server.on("/configure", HTTP_POST, [](AsyncWebServerRequest* request){
    if(request->hasParam("ssid", true) && request->hasParam("pass", true) && request->hasParam("ssap", true)){
      AsyncWebParameter* p;
      AsyncWebParameter* q;
      AsyncWebParameter* r;
      p = request->getParam("pass", true);
      q = request->getParam("ssap", true);
      if(p->value() == q->value()){
        r = request->getParam("ssid", true);
        configs.begin("wificreds", false);
        configs.putString("ssid", r->value());
        configs.putString("pass", p->value());
        configs.end();
        request->redirect("/askrestart");
      } else{
        Serial.println("Passwords not matching");
        request->redirect("/");
      }
    } else{
      Serial.println("Something missing");
      request->redirect("/");
    }
  });

  server.on("/askrestart", HTTP_GET, [](AsyncWebServerRequest* request){
    request->send(200, "text/html", "<a href=\"/restart\">Restart to apply changes</a>");
  });

  server.on("/restart", HTTP_GET, [](AsyncWebServerRequest* request){
    request->send(200, "text/html", "Goodbye");
    Serial.println("Restarting...");
    ESP.restart();
  });

  server.onNotFound([](AsyncWebServerRequest* request){
    request->redirect("/");
  });

  dnsServer.start(53, "*", apIP);
  server.begin();
}

void loop() {
  dnsServer.processNextRequest();
}

String getSSID(){
  String resp = "";
  int n = WiFi.scanNetworks();
  for(int i=0; i<n; i++){
    resp += WiFi.SSID(i);
    resp += ":::::";
  }
  return resp;
}
