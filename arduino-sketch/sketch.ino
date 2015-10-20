String message = "";
boolean messageComplete = false;
String command = "";
String value = "";

void setup() {
  Serial.begin(115200);
  message.reserve(128);
  command.reserve(4);
  value.reserve(5);
}

void loop() {
  serialEvent();
  if (messageComplete) {
    command = message.substring(0, 3);
    command.toUpperCase();

    value = message.substring(4);

    if(command == "SQN") { //Sqare North
      Serial.print("I understand SQN: ");
      Serial.println(value.toInt());
    }
    else if(command == "SQS") { //Sqare South
      Serial.print("I understand SQS: ");
      Serial.println(value.toInt());
    }
    else if(command == "SQE") { //Sqare East
      Serial.print("I understand SQE: ");
      Serial.println(value.toInt());
    }
    else if(command == "SQW") { //Sqare West
      Serial.print("I understand SQW: ");
      Serial.println(value.toInt());
    }
    else {
      Serial.print("I don't understand: ");
      Serial.println(command);
    }
    reset();
  }
}

void reset() {
  message = "";
  value = "";
  command = "";
  messageComplete = false;
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\n') {
      messageComplete = true;
    }
    else {
      message += inChar;
    }
  }
}
