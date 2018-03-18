const int ledpin = 2;
const int tone1 = 18;
const int tone2 = 19;

void setup() {
  pinMode(ledpin, OUTPUT);
  pinMode(tone1, OUTPUT);
  pinMode(tone2, OUTPUT);
}

void beep(int freq, int len){
  for(int i=0; i<len; i++){ //push-pull arrangement, louder
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

void loop() {
  /*for(int i=500; i>= 100; i--){
    beep(i, 10);
  }*/
  beep(100, 1250);
  delay(1000);
}
