var helmet = require('helmet');
var express = require('express');
var https = require('https');
var http = require('http');
var forceSSL = require('express-force-ssl');
var webSocket = require('websocket').w3cwebsocket;
var fs = require('fs');
var pug = require('pug');

// System config loading
var properties  = require('./config/app-config.json');
var httpPort    = properties.port.http;
var httpsPort   = properties.port.https;
var key         = properties.path.key;
var cert        = properties.path.cert;
var maxAge      = properties.max_age;

// Services configuration file
var servicesConfig = require('./config/services.json');

var app = express();

var enableHTTPS = false;

if (key.length !== 0 && cert.length !== 0) {
    var options = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
    };

    // Enable redirect from HTTP to HTTPS
    var securePort = httpsPort;
    app.use(forceSSL);
    app.set('forceSSLOptions', {
        httpsPort: securePort,
    });

    var secureServer = https.createServer(options, app);
    enableHTTPS = true;
}

// Sets "Strict-Transport-Security, by default maxAge is set 1 year in seconds
app.use(helmet.hsts({
    maxAge: maxAge
}));

var server = http.createServer(app);

var io = require('socket.io').listen(enableHTTPS ? secureServer : server);
var pckg = require('./package.json');

app.use(express.static('resources'));
app.set('views', './resources');
app.set('view engine', 'pug');

// Load variables in to the .pug file
app.get('/', function (req, res) {
    res.render('index', {"languages": servicesConfig.languages});
});

app.post('/version', function (req, res) { // send the version (and take it in package.json) of the application
    res.send('{"version":"' + pckg.version + '"}');
});

io.sockets.on('connection', function (socket) { // Wait for the incoming connection from the browser, the Socket.io client from index.html
    print_log('Opened connection')

    socket.on('run', function (data) { // Wait for the incoming data with the 'run' event and send data
        print_log('Executed "run"')

        // The function return the host path of one of the executors for a particular language and solver, if know
        var host 	= getExcecutorURL( data );
        
        // Check if the choosen host is configured
        if( host == undefined )
        {
            socket.emit( 'problem', {
                reason: 'No Executor available for this solver!'
            });
            return;
        }

        // Connect to the executor
        var client 	= new webSocket( host );
        
        print_log('Connecting to "' + host + '"')

        client.onopen = function () { // Opens the connection and send data
            print_log('Sending to EmbASPServerExecutor:\n' + JSON.stringify(JSON.parse(data), null, '\t'))
            client.send(data);
        };
        
        client.onerror = function (error) {
            print_log('WebSocket problem:\n' + JSON.stringify(error, null, '\t'));
            socket.emit('problem', {
                reason: error
            });
            socket.emit('problem', {
                reason: 'Execution error, please try again later!'
            });
        };
        
        client.onmessage = function (output) { // Wait for the incoming data from the EmbASPServerExecutor
            var model = JSON.parse(output.data);
            print_log('From EmbASPServerExecutor:\nModel "' + model.model + '"\nError "' + model.error + '"'); // debug string
            socket.emit('output', model); // Socket.io calls emit() to send data to the browser.
        };
    });
});

if (enableHTTPS) {
    secureServer.listen(securePort, function () {
        print_log('App listening on secure port ' + securePort);
        print_log('Version: ' + pckg.version);
    });
}

server.listen(httpPort, function () {
    print_log('App listening on port ' + httpPort);
    print_log('Version: ' + pckg.version);
});

function print_log(statement) {
    console.log('%s: %s', (new Date()).toLocaleString(), statement); // debug string
}

function getExcecutorURL(data) {
    data = JSON.parse(data);
    for(var i in servicesConfig.languages) {
        if(servicesConfig.languages[i].value === data.language) {
            var solvers = servicesConfig.languages[i].solvers;
            for(var j in solvers) {
                // FIXME: The client should pass 'solver' parameter and not 'engine'
                if(solvers[j].value === data.engine) {
                    var executors = solvers[j].executors;
                    for(var k in executors) {
                        if(executors[k].value === data.executor) {
                            return executors[k].protocol + '://' + executors[k].url + ':' + executors[k].port + executors[k].path;
                        }
                    }
                }
            }
        }
    }
}