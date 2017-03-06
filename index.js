var bp = require('./main/bpmn.js');
var Q = require('q');
var getBPJSON = function(req,res){
  bp.bpm2json().then(function(data){
    console.log(data);
    res.status(200);
    res.end(JSON.stringify(data));
  });

}
var express = require('express')
var app = express()

app.get('/bpmn',getBPJSON);

app.listen(3000)
