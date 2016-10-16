var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'resources')));
var request = require('request');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));

var a;
app.post('/run', function(req, res) {
    var a=req.body;
    var b;
    console.log(a);

      request.post({

            url: 'http://localhost:8080/EmbASPExecutor/home',
            method: 'POST',
            json: a
        },
        function (err, httpResponse, body) {
            console.log(body);
            b=body;
        });
        res.send(req.body);
});
  


app.listen(8084, function() {
    console.log('App listening on port 8084!');
});