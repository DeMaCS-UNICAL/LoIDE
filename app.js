var helmet = require('helmet');
var express = require('express');
var https = require('https');
var fs = require('fs');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('resources/config/properties');
var options = {
    key: fs.readFileSync(properties.get("path.key")),
    cert: fs.readFileSync(properties.get("path.cert"))
};
var app = express();

// Sets "Strict-Transport-Security, by default maxAge is setted 1 year in second
app.use(helmet.hsts({
  maxAge: properties.get("max.age")
}));

var webSocket = require('websocket').w3cwebsocket;
var secureServer = https.createServer(options, app);
var io = require('socket.io').listen(secureServer, {secure:true});
var ws_server = properties.get('ws.server');
var pckg = require('./package.json');

var port = properties.get('port');

app.use(express.static('resources'));

app.post('/version', function (req, res) { // send the version (and take it in package.json) of the application
    res.send('{"version":"' + pckg.version + '"}');
});

io.sockets.on('connection', function (socket) { // Wait for the incoming connection from the browser, the Socket.io client from index.html

    socket.on('run', function (data) { // Wait for the incoming data with the 'run' event and send data

        var client = new webSocket(ws_server); // connet to the EmbASPServerExecutor
        console.log(ws_server + " path"); // debug string

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
        client.onmessage = function (output) { // Wait for the incoming data from the EmbASPServerExecutor
            var model = JSON.parse(output.data);
//          console.log("%j from EmbASPServerExecutor", model); // debug string
            console.log('From EmbASPServerExecutor: "model":"%s", "error":"%s"', model.model, model.error); // debug string
            socket.emit('output', model); // Socket.io calls emit() to send data to the browser.

        };

    });
});

secureServer.listen(port, function () {
    console.log('App listening on port ' + port);
    console.log('Version: ' + pckg.version);
});
