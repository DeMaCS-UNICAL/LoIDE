var express = require('express');
var http = require('http');
var app = express();
var path = require('path');
var webSocket = require('websocket').w3cwebsocket;
var fs = require('fs');
var multer = require('multer');
var bodyParser = require('body-parser');

var port=8084;

var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(path.join(__dirname, 'resources')));

var upload = multer({
    dest: 'uploads/'
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) { // Send the response to index.html
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) { // Wait for the incoming connection from the browser, the Socket.io client from index.html

    socket.on('run', function (data) { // Wait for the incoming data with the 'feedback' event and send data

        var client = new webSocket('ws://localhost:8080/ASPServerExecutor/home'); // connet to the ASPServerExecutor

        client.onopen = function () { // Opens the connection and send data 
            client.send(data);
        };
        client.onerror = function () {
            console.log('Connection Error');
        };
        client.onmessage = function (output) { // Wait for the incoming data from the EmbASPExecutor
            var model = JSON.parse(output.data);
            socket.emit('output', model); // Socket.io calls emit() to send data to the browser.

        };

    });
});

app.post("/file-upload", upload.single('file'), function (req, res, next) {
    fs.readFile(req.file.path, 'utf8', function (err, data) { // read file from the request
        res.send(data); // send contents 
    });
});



server.listen(port, function () {
    console.log('App listening on port '+port);
});