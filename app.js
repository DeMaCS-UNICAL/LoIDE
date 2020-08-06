var helmet = require('helmet');
var express = require('express');
var https = require('https');
var http = require('http');
var forceSSL = require('express-force-ssl');
var webSocket = require('websocket').w3cwebsocket;
var fs = require('fs');
var jpointer = require('json-pointer');
const compression = require('compression');

const environment =  {
    dev: 'development',
    prod: 'production'
}

const path =  {
    dist: 'dist',
    src: 'resources'
}

const currentEnv = process.env.NODE_ENV || environment.dev
const resourcesPath = currentEnv == environment.prod ? path.dist : path.src

// System config loading
var properties  = require('./config/app-config.json');
var httpPort    = properties.port.http;
var httpsPortP  = properties.port.https;
var key         = properties.path.key;
var cert        = properties.path.cert;
var maxAge      = properties.max_age;

// Services configuration file
var servicesConfig = require('./config/services.json');

// This function validates the JSON schemas
var Ajv = require('ajv');
validateJsonSchemas();

var pckg = require('./package.json');

var app = express();

var server = http.createServer(app);

var enableHTTPS = false;

if (key.length !== 0 && cert.length !== 0) {
    enableHTTPS = true;

    var options = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
    };

    // Enable redirect from HTTP to HTTPS
    app.use(forceSSL);
    app.set('forceSSLOptions', {
        httpsPort: httpsPortP,
    });

    var secureServer = https.createServer(options, app);
}

// Sets "Strict-Transport-Security, by default maxAge is set 1 year in seconds
app.use(helmet.hsts({
    maxAge: maxAge
}));

app.use(compression());
app.use(express.static(resourcesPath));
app.set('views', './' + resourcesPath);
app.set('view engine', 'pug');

// Load variables in to the .pug file
app.get('/', function (req, res) {
    res.render('index', {"languages": servicesConfig.languages});
});

app.post('/version', function (req, res) { // send the version (and take it in package.json) of the application
    res.send('{"version":"' + pckg.version + '"}');
});

var io = require('socket.io').listen(enableHTTPS ? secureServer : server);

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
    secureServer.listen(httpsPortP, function () {
        print_log('App listening on secure port ' + httpsPortP);
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

function validateJsonSchemas() {
     // Validate JSON file with the relative scheme
    var servicesValidation  = validateSchema('./config/services.json', './config/services-schema.json');
    var appConfigValidation = validateSchema('./config/app-config.json', './config/app-config-schema.json');

    if(servicesValidation.criticalError || appConfigValidation.criticalError) {
        console.log('Fatal error: configuration files are not setted up properly!');
        process.exit(1);
    }
}

function validateSchema(jsonPath, schemaPath) {
    // Loading files
    var json        = require(jsonPath);
    var schema      = require(schemaPath);
    
    // Config
    var ajv = new Ajv({
        allErrors: true, 
        jsonPointers: true
    });

    // Compiling the schema
    var compiledSchema  = ajv.compile(schema);
    var validated       = false;
    var printError      = true;
    var response        = { };

    while(!validated) {
        // Validating
        var validatedJson = compiledSchema(json);
        // If some there is some error, the nearest parent object in the file, containing this error, is deleted
        if (!validatedJson) {
            // Prints the errors only the first time
            if(printError) {
                console.log(compiledSchema.errors);
                printError = false;
            }

            for(var index in compiledSchema.errors) {
                var path = compiledSchema.errors[index].dataPath;
                if(path === '') {
                    // 'This' case happen when there is a problem in to the root of the json file (eg. when the file is empty)
                    console.log('Fatal error: ' + jsonPath + ' is not setted up properly!');
                    response.criticalError = true;
                    validated = true;
                } else {
                    jpointer.remove(json, path);
                }
            }
        }
        else {
            console.log('Validated: ' + jsonPath);
            validated = true;
        }
    }

    return response;
}