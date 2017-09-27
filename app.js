var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var pug = require('pug');

var webSocket = require('websocket').w3cwebsocket;

var config = require('./resources/config/app-config.json');
var port = config.port;

// TODO "services-old.json" had to be replaced by "services.json"
var services = require('./resources/config/services-old.json');
var ws_servers = services.services;

var pckg = require('./package.json');

// This funcion validates the JSON configuration files
var Ajv = require('ajv');
validateConfigurationFiles();

app.use(express.static('resources'));
app.set('views', './resources');
app.set('view engine', 'pug');

app.get('/', function (req, res) {
    res.render('index', {"executors": ws_servers});
})

app.post('/version', function (req, res) { // send the version (and take it in package.json) of the application
    res.send('{"version":"' + pckg.version + '"}');
});

io.sockets.on('connection', function (socket) { // Wait for the incoming connection from the browser, the Socket.io client from index.html
    socket.on('run', function (data) { // Wait for the incoming data with the 'run' event and send data
        var host = getExcecutor(data).host; //The function return the address for a particular language and engine, if known
        var client = new webSocket(host); // Connect to the engine
        console.log(host + " path"); // debug string
        console.log(data + " from gui"); // debug string

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

function validateConfigurationFiles() {
    // TODO add all the schemas and manage the errors
    // Validating services.json
    var services_schema = require('./resources/config/json-schema/services-schema.json');
    var language_schema = require('./resources/config/json-schema/language-schema.json');
    var solver_schema = require('./resources/config/json-schema/solver-schema.json');
    var executor_schema = require('./resources/config/json-schema/executor-schema.json');

    var ajv_services = new Ajv();
    ajv_services.addSchema([language_schema, solver_schema, executor_schema]);
    var validate_services = ajv_services.compile(services_schema);
    var valid_services = validate_services(require('./resources/config/services.json'));
    if (!valid_services)
        console.log(validate_services.errors);
    else
        console.log('Validated: services.json')

    // Validating app-config.json
    var app_config_schema = require('./resources/config/json-schema/app-config-schema.json');
    var ajv_app_config = new Ajv();
    var validate_app_config = ajv_app_config.compile(app_config_schema);
    var valid_app_config = validate_app_config(require('./resources/config/app-config.json'));
    if(!valid_app_config)
        console.log(validate_app_config.errors);
    else
        console.log('Validated: app-config.json')
}