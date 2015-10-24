# Web page communication with Arduino via Node.js and Socket.IO

This repository contains the arduino sketch and node.js code necessary for a web page to communicate with the Arduino.

The communication happens over serial connection.

The following will go through the installation process of each necessary parts and how to use and manipulate the existing sample.

## Install

The installation process is only described from a Ubuntu point of view, but most is applicable to other operating systems.

### Node.js

The code is tested with Node.js v0.10 stable. It can be installed via directly downloading it from here: https://nodejs.org/en/blog/release/v0.10.36/ or using [nvm](https://github.com/creationix/nvm), like so:

    $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
    $ nvm install 0.10
    $ nvm use 0.10

Beware that you might need to run `node` as `sudo`, in order for the joystick to be recognized. This can be little challenging, but the problem has been fixed by adding

    alias sudo='sudo env PATH=$PATH:$NVM_BIN'

to the `~/.profile` file. https://github.com/creationix/nvm#problems

### Arduino

The arduino drivers and IDE can be downloaded from the [arduino.org website](http://www.arduino.org/software#ide).
Open the arduino sketch in the IDE, select the correct Board (fx. Uno) and serial port (fx. `COM3` or `/dev/ttyACM0`) and upload the sketch.

## Usage

- Upload the arduino sketch to the arduino board.
- Navigate to the `node-client` folder in your terminal.
- Edit [line 7 in `index.js`](https://github.com/hanstdam/node-arduino-web-communication/blob/master/node-client/index.js#L7) to have the correct serial port name.
- Run `npm install` to install the dependencies
- Run `node .` to start the program. If it outputs `listening on http://localhost:3023` everything is ready.
- Open a browser and navigate to `http://localhost:3023`

## Extending the sample

This sample contains a static website with three boxes (North, East, West, South). Once the boxes are hovered a `message` is send to the arduino. The message is simply `SQN:1` for `Square North, hovered` or `SQW:0` for `Square West, not hovered`. The messages is defined in [index.html](https://github.com/hanstdam/node-arduino-web-communication/blob/master/node-client/public/index.html) and simply routed by the node serve to the arduino.

### The protocol

The node program sends commands to the arduino with a simple protocol. The messages look something like this:

    BNY:1

Where the first 3 letters are the "command" followed by a colon and a value.
This makes it easy for the arduino to understand the command and the value.
The command could be longer, but then the arduino sketch would have to be changed as well. Further, the less you send to the arduino, the faster the communication will happen.

### Adding events

Adding events, is a matter of adding some control on the web page, emitting an event on change and having the arduino react to the incomming message.

Let's add a simple event triggered by a button on the web page, which turns on a LED when pressed and shuts it off the LED when released.

#### The web page

Add the folloing markup to [index.html](https://github.com/hanstdam/node-arduino-web-communication/blob/master/node-client/public/index.html):

```HTML
...
<body>
...
<button class="red-led-trigger">Press to turn on red LED</button>
...
</body>
...
```

Adn the following javascript to [index.html](https://github.com/hanstdam/node-arduino-web-communication/blob/master/node-client/public/index.html):

```JavaScript
...
function initEventListeners() {
  ...
  var redLedButton = document.querySelector('.red-led-trigger')
  redLedButton.addEventListener('mousedown', sendLedMessage.bind(null, '1'))
  redLedButton.addEventListener('mouseup', sendLedMessage.bind(null, '0'))

  function sendLedMessage(value, event) {
    socket.emit('message', 'RLT:' + value)
  }
  ...
}
```

#### Arduino sketch
The arduino sketch needs to recognize the events we are sending to it. Further we need to define what the arduino should do when an event is received.

In the [arduino sketch](https://github.com/hanstdam/node-arduino-web-communication/blob/master/arduino-sketch/sketch/sketch.ino#L25-L28) each command needs to have a special case. A case for our example could look like this:

```Arduino
const int redLEDPin = 8;
void setup() {
    ...
    pinMode(redLEDPin, OUTPUT);
}

void loop() {
...
  else if(command == "RLT") {
    if (value.toInt() === 1) {
      digitalWrite(redLEDPin, HIGH);
    } else {
      digitalWrite(redLEDPin, LOW);
    }
  }
...
}
```

The `command` is always the first 3 letters in upper case. The `value` is always a string with everything after the colon (`:`) in the message.

### Reduce the bandwidth

It has not been tested with all commands from the controller, but the serial connection between the arduino and node is slow. This means that you could run into troubles like delayed or dropped messages.
In general keep the commands and values small, and reduce the number of events to a minimum to avoid these problems.

## Troubleshooting

 - Do not have the arduino IDE serial monitor open while the node program is running.
 - Close the node program (Ctrl+C) before uploading a new sketch to the arduino.
 - Make sure the correct serial port is used in your node program. Change [line 7 in `index.js`](https://github.com/hanstdam/node-arduino-web-communication/blob/master/node-client/index.js#L7) to have the correct serial port.
 - If you get the error `Error: ENOENT, stat 'C:\Users\{username}\AppData\Roaming\npm` you can fix the problem by creating the `npm` folder in `C:\Users\{username}\AppData\Roaming` folder. [See StackOverflow answer](http://stackoverflow.com/questions/25093276/node-js-windows-error-enoent-stat-c-users-rt-appdata-roaming-npm).

## License

MIT