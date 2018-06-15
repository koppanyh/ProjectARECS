const int configPin = 25;
const int apIdPins[4] = {32, 33, 34, 35};
const char hexcodes[16] = {'0','1','2','3','4','5','6','7',
  '8','9','a','b','c','d','e','f'};

void setup() {
  Serial.begin(115200);
  pinMode(configPin, INPUT);
  for(int i=0; i<4; i++) pinMode(apIdPins[i], INPUT);
  Serial.println();
}

void loop() {
  Serial.println(digitalRead(configPin));
  uint8_t v = 0;
  for(int i=3; i>=0; i--){
    bool a = digitalRead(apIdPins[i]);
    Serial.print(a);
    Serial.print(" ");
    v <<= 1;
    if(a) v |= 1;
  }
  Serial.println();
  Serial.print((int)v);
  Serial.print(" ");
  Serial.println(hexcodes[v]);
  delay(1000);
}
