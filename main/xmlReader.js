var Q = require('q');
var fs = require('fs');


exports.xmlReader = function(filename){
var readerDefer = Q.defer();

fs.readFile('./bpmn/'+filename+'.xml', function(err, data) {
    if(err){
      readerDefer.reject({"status":404,"body":err});
    }
    else{
      var refinedData = data.toString();
      //console.log("XML: ", refinedData);
      readerDefer.resolve({"status":200,"body":refinedData});
    }
});

return readerDefer.promise;
}
