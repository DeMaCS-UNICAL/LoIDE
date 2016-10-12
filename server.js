var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'resources')));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));


app.listen(8084, function() {
    console.log('App listening on port 8084!');
});