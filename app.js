var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var pug = require('pug');

var webSocket = require('websocket').w3cwebsocket;

var config = require('./resources/config/app-config.json');
var port = config.port;

var services_config = require('./resources/config/services.json');

var pckg = require('./package.json');

// This funcion validates the JSON configuration files
var Ajv = require('ajv');
validateConfigurationFiles();

app.use(express.static('resources'));
app.set('views', './resources');
app.set('view engine', 'pug');

app.get('/', function (req, res) {
    res.render('index', {"services": services_config.services});
});

app.post('/version', function (req, res) { // send the version (and take it in package.json) of the application
    res.send('{"version":"' + pckg.version + '"}');
});

io.sockets.on('connection', function (socket) { // Wait for the incoming connection from the browser, the Socket.io client from index.html
    // Check the services.json for the received language and sends solvers for this
    socket.on('changeLanguage', function (data) {
        var error = true;
        for (var index = 0; index < services_config.services.length; index++) {
            var language = services_config.services[index];
            if(language.language === data) {
                socket.emit('changeLanguageRes', language.solvers);
                error = false;
                break;
           }
       }
       // Sends the error event if the received language is not found in services.json
       if(error) socket.emit('changeLanguageError');
    });
    // Check the services.json for the received solver and sends options for this
    socket.on('changeSolver', function (data) {
        var error = true;
        for (var i = 0; i < services_config.services.length; i++) {
            var language = services_config.services[i];
            if(language.language === data["language"]) {
                for (var j = 0; j < language.solvers.length; j++) {
                    var solver = language.solvers[j];
                    if(solver.solver === data["solver"]) {
                        socket.emit('changeSolverRes', solver.options);
                        error = false;
                        break;
                    }
                }
                break;
            }
        }
        // Sends the error event if the received solver is not found in services.json
        if(error) socket.emit('changeSolverError');
    });
    socket.on('run', function (data) { // Wait for the incoming data with the 'run' event and send data
        var host = getExcecutorURL(data); // The function return the address for a particular language and solver, if known
        var client = new webSocket(host); // Connect to the solver
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
        client.onmessage = function (output) { // Wait for the incoming data from the EmbASPServerExecutor
            var model = JSON.parse(output.data);
            console.log(model + " from EmbASPServerExecutor"); // debug string
            socket.emit('output', model); // Socket.io calls emit() to send data to the browser.

        };
    });
});

server.listen(port, function () {
    console.log('App listening on port ' + port);
    console.log('Version: ' + pckg.version);
});

function getExcecutorURL(data) {
    data = JSON.parse(data);
    for(var i in services_config.services) {
        if(services_config.services[i].language === data.language) {
            var solvers = services_config.services[i].solvers;
            for(var j in solvers) {
                if(solvers[j].solver === data.solver) {
                    // TODO let the user choose the executor. atm this is a missing data
                    // by default the first executor will be chosen
                    var executor = solvers[j].executors[0];
                    return executor.protocol + '://' + executor.url + ':' + executor.port + executor.path;
                }
            }
        }
    }
}

function validateConfigurationFiles() {
    var jpointer = require('json-pointer');
    var services_validation = false;
    var app_config_validation = false;
    var abort_application = false;

    var error_print = true;

    // Validating services.json
    var services_schema = require('./resources/config/services-schema.json');

    var ajv_services = new Ajv({'allErrors': true, 'jsonPointers': true});
    var validate_services = ajv_services.compile(services_schema);
    while(!services_validation) {
        var valid_services = validate_services(require('./resources/config/services.json'));
        // If some there is some error, the nearest parent object in the services.json file, containing this error, is deleted
        if (!valid_services) {
            // Prints the errors only the first time
            if(error_print) {
                console.log(validate_services.errors);
                error_print = false;
            }

            for(var index in validate_services.errors) {
                var path = validate_services.errors[index].dataPath;
                if(path === '') {
                    // 'This' case happen when there is a problem in to the root of the services.json file (eg. when the file is empty)
                    // ..this condition will abort the entire application
                    console.log('Fatal error: services.json is not setted up properly!');
                    abort_application = true;
                    services_validation = true;
                } else {
                    jpointer.remove(services_config, path);
                }
            }
        }
        else {
            console.log('Validated: services.json');
            services_validation = true;
        }
    }

    error_print = true;
    // Validating app-config.json
    var app_config_schema = require('./resources/config/app-config-schema.json');
    var ajv_app_config = new Ajv({'allErrors': true, 'jsonPointers': true});
    var validate_app_config = ajv_app_config.compile(app_config_schema);

    while(!app_config_validation) {
        var valid_app_config = validate_app_config(require('./resources/config/app-config.json'));
        // If some there is some error, the nearest parent object in the app-config.json file, containing this error, is deleted
        if (!valid_app_config) {
            // Prints the errors only the first time
            if(error_print) {
                console.log(validate_app_config.errors);
                error_print = false;
            }

            for(var index in validate_app_config.errors) {
                var path = validate_app_config.errors[index].dataPath;
                if(path === '') {
                    // 'This' case happen when there is a problem in to the root of the app-config.json file (eg. when the file is empty)
                    // ..this condition will abort the entire application
                    console.log('Fatal error: app-config.json is not setted up properly!');
                    abort_application = true;
                    app_config_validation = true;
                } else {
                    jpointer.remove(config, path);
                }
            }
        }
        else {
            console.log('Validated: app-config.json');
            app_config_validation = true;
        }
    }

    if(abort_application) {
        console.log('Fatal error: configuration files are not setted up properly!');
        process.exit(1);
    }
}