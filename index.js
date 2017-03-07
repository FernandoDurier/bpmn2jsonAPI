var bp = require('./main/bpmn.js');
var bodyParser = require('body-parser');
var Q = require('q');

var getBPJSON = function(req,res){
  bp.bpm2json().then(function(data){
    console.log(data);
    res.status(200);
    res.end(JSON.stringify(data));
  });

}
var postBPJSON = function(req,res){
  bp.bpmn2jsonP(req.body.xml,req.body.name).then(function(data){
    console.log(data);
    res.status(200);
    res.end(JSON.stringify(data));
  });

}

var express = require('express')
var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/bpmn',getBPJSON);
app.post('/bpmn2json',postBPJSON);

app.listen(3000)
