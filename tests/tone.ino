const int ledpin = 2;
const int tone1 = 18;
const int tone2 = 19;

void setup() {
  pinMode(ledpin, OUTPUT);
  pinMode(tone1, OUTPUT);
  pinMode(tone2, OUTPUT);
}

void beep(int freq, int len){
  freq >>= 1;
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
  beep(500, 200); //success
  beep(1000, 100);
  delay(3000);
  
  beep(10000, 100); //config set
  delay(3000);
  
  for(int i=0; i<50; i++){ //failure
    beep(1000, 10);
    delay(10);
  }
  delay(3000);
}
