var bp = require('./main/bpmn.js');
var Q = require('q');

var getBPJSON = function(req,res){
  bp.bpm2json(req.body.filename,req.body.newname).then(function(data){
    console.log(data);
    res.status(200);
    res.end(JSON.stringify(data));
  });

}

var directJSON = function(req,res){
  bp.directjson(req.body.xml).then(function(data){
    console.log(data);
    res.status(200);
    res.end(JSON.stringify(data));
  });

}

var express = require('express');

var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.post('/bpmn2json/file',getBPJSON);
app.post('/bpmn2json/string',directJSON);

app.listen(3000);
