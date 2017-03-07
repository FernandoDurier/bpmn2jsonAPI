var fs = require('fs'),
    xml2js = require('xml2js');
var beautify = require("json-beautify");
var Q = require('q');

exports.bpm2json = function(){
var bpDefer = Q.defer();
var parser = new xml2js.Parser();

fs.readFile('./bpmn/teste de xml.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        //console.log(beautify(result,null,2,100));
        //console.log(result.process.laneSet[0].lane);
        bpDefer.resolve(result);
        fs.writeFile('./bpmn/teste de xml.json',JSON.stringify(result),function(err,data){
          if(err){
            console.log(err);
          }
        });
        console.log('Done');
    });
});
return (bpDefer.promise);

}

exports.bpmn2jsonP = function(xml,name){
  var bpDefer = Q.defer();
  var parser = new xml2js.Parser();

  parser.parseString(xml, function (err, result) {
      //console.log(beautify(result,null,2,100));
      //console.log(result.process.laneSet[0].lane);
      bpDefer.resolve(result);
      fs.writeFile('./bpmn/'+name+'.json',JSON.stringify(result),function(err,data){
        if(err){
          console.log(err);
        }
      });
      console.log('Done');
  });

  return bpDefer.promise;
}
