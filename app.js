var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var multer = require('multer');
var upload = multer({
    dest: 'uploads/'
});
var request = require('request');
var bodyParser = require('body-parser');
app.use(express.static(path.join(__dirname, 'resources')));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/run', function (req, res) {
    var data = req.body; // take data and options from http request and save it to a local variable

    request.post({
            url: 'http://localhost:8080/EmbASPExecutor/home?metod=sync', // send data to EmbASPExecutor in json format -- temporarely metod sync
            method: 'POST',
            json: data
        },
        function (err, httpResponse, body) {
            if (!err)
                res.send(body); // send the solution of the data by http rosponse to the gui
        });


});

app.post("/file-upload", upload.single('file'), function (req, res, next) {
    fs.readFile(req.file.path, 'utf8', function (err, data) {   // read file from the request
        res.send(data); // send contents 
    });
});



app.listen(8084, function () {
    console.log('App listening on port 8084!');
});