var xml2js = require('xml2js');
var Q = require('q');

exports.refinement = function(xml){
var refDefer = Q.defer();
//console.log("Input XML: ",xml);
xml2js.parseString(xml,{mergeAttrs:true,explicitArray:false},function(err, result){
  if(err){
    refDefer.reject({"status":500,"body":err});
  }
  else{
    //console.log("Result: ", result);
    refDefer.resolve({"status":200,"body":result});
  }
});
return refDefer.promise;
}
