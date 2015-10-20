var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var Queue = require('queue')
var serialPortLib = require('serialport')
var SerialPort = serialPortLib.SerialPort
var serialPort = new SerialPort('/dev/ttyACM0', {
  baudrate: 115200,
  parser: serialPortLib.parsers.readline('\n')
})

var queue = Queue({
  concurrency: 1
})

var writeToSerial

function dummySerialWriter (message, callback) {
  console.warn('Serialport not connected yet. Message "' + message + '" not send.')
  callback()
}

writeToSerial = dummySerialWriter

function writeAndDrain (data, callback) {
  serialPort.write(data + '\n', function () {
    serialPort.drain(callback)
  })
}

serialPort.on('open', function () {
  writeToSerial = writeAndDrain

  serialPort.on('data', function (data) {
    console.log('Data received:', data)
  })
})

queue.start()

function sendArduinoMessage (message) {
  queue.push(function (callback) {
    writeToSerial(message, callback)
  })
  queue.start()
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

io.on('connection', function(socket) {
  socket.on('message', function(msg) {
    sendArduinoMessage(msg)
  });
});

http.listen(3023, function() {
  console.log('listening on http://localhost:3023')
})
