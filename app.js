var helmet = require('helmet');
var express = require('express');
var https = require('https');
var http = require('http');
var forceSSL = require('express-force-ssl');
var webSocket = require('websocket').w3cwebsocket;
var fs = require('fs');
var propertiesReader = require('properties-reader');

var properties = propertiesReader('config/properties');

var app = express();

var key = properties.get("path.key");
var cert = properties.get("path.cert");
var enableHTTPS = false;

if (key !== 0 && cert !== 0) {
    var options = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
    };

    // Enable redirect from HTTP to HTTPS
    var securePort = properties.get('port.https');
    app.use(forceSSL);
    app.set('forceSSLOptions', {
        httpsPort: securePort,
    });

    var secureServer = https.createServer(options, app);
    enableHTTPS = true;
}

// Sets "Strict-Transport-Security, by default maxAge is setted 1 year in second
app.use(helmet.hsts({
    maxAge: properties.get("max.age")
}));

var server = http.createServer(app);

var io = require('socket.io').listen(enableHTTPS ? secureServer : server);
var ws_server = properties.get('ws.server');
var pckg = require('./package.json');

var port = properties.get('port.http');

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
                reason: "Execution error, please try again later!"
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

if (enableHTTPS) {
    secureServer.listen(securePort, function () {
        console.log('App listening on secure port ' + securePort);
        console.log('Version: ' + pckg.version);
    });
}
server.listen(port, function () {
    console.log('App listening on port ' + port);
    console.log('Version: ' + pckg.version);
});
