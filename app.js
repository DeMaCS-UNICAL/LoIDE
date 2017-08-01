var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var webSocket = require('websocket').w3cwebsocket;

var properties = require('./resources/config/properties.json');
var ws_servers = properties.servers;
var port = properties.port;

var pckg = require('./package.json');

app.use(express.static('resources'));

app.post('/version', function (req, res) { // send the version (and take it in package.json) of the application
    res.send('{"version":"' + pckg.version + '"}');
});

io.sockets.on('connection', function (socket) { // Wait for the incoming connection from the browser, the Socket.io client from index.html
    socket.on('run', function (data) { // Wait for the incoming data with the 'run' event and send data
        var host = getExcecutor(data).host;
        var client = new webSocket(host); // connet to the ASPServerExecutor
        console.log(host + " path"); // debug string

        client.onopen = function () { // Opens the connection and send data
            client.send(data);
            console.log(data + " from gui"); // debug string
        };
        client.onerror = function (error) {
            socket.emit('problem', {
                reason: error
            });
            socket.emit('problem', {
                reason: "Sorry the connection lost, please try again later!"
            });
        };
        client.onmessage = function (output) { // Wait for the incoming data from the ASPServerExecutor
            var model = JSON.parse(output.data);
            console.log(model + " from ASPServerExecutor"); // debug string
            socket.emit('output', model); // Socket.io calls emit() to send data to the browser.

        };

    });
});

server.listen(port, function () {
    console.log('App listening on port ' + port);
    console.log('Version: ' + pckg.version);
});

function getExcecutor(data) {
  data = JSON.parse(data);
  for(i in ws_servers) {
    if(ws_servers[i].language === data.language) {
      var engines = ws_servers[i].engines;
      for(j in engines) {
        if(engines[j].name === data.engine) {
          return engines[j];
        }
      }
    }
  }
}
