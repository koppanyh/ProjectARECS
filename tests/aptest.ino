#include <WiFi.h>
#include <FS.h>
#include <AsyncTCP.h> //https://github.com/me-no-dev/AsyncTCP
#include <ESPAsyncWebServer.h> //https://github.com/me-no-dev/ESPAsyncWebServer

String ssid = "ARECS_Node_1";
String password = "password1";

const char index_html[] PROGMEM =
  "<!DOCTYPE HTML>\n"
  "<html>\n"
  "  <head>\n"
  "    <title>ARECS Configuration</title>\n"
  "    <meta charset=\"utf-8\">\n"
  "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
  "  </head>\n"
  "  <body>\n"
  "  <b>ARECS Configuration Page</b><br><br>\n"
  "  <form action=\"/api\" method=\"POST\">\n"
  "    Node Identifier<br>\n"
  "    <input type=\"text\" name=\"nid\" style=\"background-color: #ffa\" value=\"2342\"><br>\n"
  "    *Changing this could break something, proceed with caution!<br><br>\n"
  "    Select Wifi Network<br>\n"
  "    <select id=\"ssids\" name=\"ssid\">\n"
  "      <option value=\"SSID 1\">SSID 1</option>\n"
  "      <option value=\"SSID 2\">SSID 2</option>\n"
  "    </select><br><br>\n"
  "    Type in Wifi Password<br>\n"
  "    <input type=\"password\" name=\"pass\"><br><br>\n"
  "    <input type=\"submit\" value=\"Save and Reboot\">\n"
  "  </form>\n"
  "  </body>\n"
  "</html>\n";

AsyncWebServer server(80);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  WiFi.softAP(ssid.c_str(), password.c_str());
  
  Serial.println("");
  Serial.print("IP Addr: ");
  Serial.println(WiFi.softAPIP());

  server.on("/", HTTP_GET, [](AsyncWebServerRequest* request){
    Serial.print("Connection made: ");
    Serial.println(request->url());
    request->send(200, "text/html", index_html);
  });

  server.on("/getssids", HTTP_GET, [](AsyncWebServerRequest* request){
    request->send(200, "text/html", getSSID());
  });

  server.onNotFound([](AsyncWebServerRequest* request){
    request->redirect("/");
  });

  server.begin();
}

void loop() {
  // put your main code here, to run repeatedly:

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
