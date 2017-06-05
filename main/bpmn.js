var fs = require('fs');
var to_json = require('xmljson').to_json;
var reader = require('./xmlReader.js');
var refiner = require('./xmlRefinement.js');
var beautify = require("json-beautify");
var Q = require('q');

exports.bpm2json = function(filename,newname){
var bpDefer = Q.defer();

reader.xmlReader(filename)
.then(
  function(data){
    console.log("data.status: ",data.status);
    refiner.refinement(data.body)
    .then(
      function(data){
        console.log("Refineded: ",data.body);
        bpDefer.resolve({"status":data.status,"body":data.body});
      }
    );
  }
);

return (bpDefer.promise);
}

exports.directjson = function(xml){
var bpDefer = Q.defer();

    refiner.refinement(xml)
    .then(
      function(data){
        //console.log("Refineded: ",data.body);
        bpDefer.resolve({"status":data.status,"body":data.body});
      }
    );


return (bpDefer.promise);
}
