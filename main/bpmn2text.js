var Q = require('q');
var fs = require('fs');
var exemplo = require('../bpmn/exemplo de processo.json');

var procbuild = false;
var finalText = ""; //final text to be returned
var bpmn;//process` json
var processName = "";

var actors = []; //mapped actors
var tasks = []; //mapped tasks
var flows = []; //mapped flows
var start; //mapped start event
var end; //mapped end or intermediate event
var orgateways = []; //mapped or gateways and its flows
var andgateways = []; //mapped and gateways and its flows

//process variables setters
var bpmnBuilder = function(proc){
    var buildDefer = Q.defer();
    if(proc !== undefined){
        procbuild = true;
        bpmn = proc["bpmn:definitions"]["bpmn:process"];
        buildDefer.resolve({"status":200,"body":"Process Built !!"});
    }
    else{
        buildDefer.reject({"status":404,"body":"Error ... Process Not Found"});
    }
    return buildDefer.promise;
}

var actorsMapper = function(){
    var actorsBuildDefer = Q.defer();
    if(procbuild && bpmn["bpmn:laneSet"]["bpmn:lane"]){
        actors = bpmn["bpmn:laneSet"]["bpmn:lane"];
        actorsBuildDefer.resolve({"status":200,"body":"Actors Mapped"});
    }
    else{
        actorsBuildDefer.reject({"status":404,"body":"Actors Not Found"});
    }
    return actorsBuildDefer.promise;
}

var tasksMapper = function(){
    var tasksBuildDefer = Q.defer();
    if(procbuild && bpmn['bpmn:task']){
        tasks = bpmn['bpmn:task'];
        tasksBuildDefer.resolve({"status":200,"body":"Tasks Mapped"});
    }
    else{
        tasksBuildDefer.reject({"status":404,"body":"Tasks Not Found"});
    }
    return tasksBuildDefer.promise;
}

var flowsMapper = function(){
    var flowBuildDefer = Q.defer();
    if(procbuild && bpmn["bpmn:sequenceFlow"]){
        flows = bpmn['bpmn:sequenceFlow'];
        flowBuildDefer.resolve({"status":200,"body":"Flows Mapped"});
    }
    else{
        flowBuildDefer.reject({"status":404,"body":"Flows Not Found"});
    }
    return flowBuildDefer.promise;
}

var startMapper = function(){
    var startBuildDefer = Q.defer();
    if(procbuild && bpmn["bpmn:startEvent"]){
        start = bpmn['bpmn:startEvent'];
        startBuildDefer.resolve({"status":200,"body":"Start Mapped"});
    }
    else{
        startBuildDefer.reject({"status":404,"body":"Start Not Found"});
    }
    return startBuildDefer.promise;
}

var endMapper = function(){
    var endBuildDefer = Q.defer();
    if(procbuild && (bpmn["bpmn:endEvent"] || bpmn["bpmn:intermediateThrowEvent"]) ){ //the end event can appear as an intermediate one, so ... any of those would be mapped 
        if(bpmn["bpmn:endEvent"]){
            end = bpmn['bpmn:endEvent'];
        }
        end = end + bpmn["bpmn:intermediateThrowEvent"] ;
        endBuildDefer.resolve({"status":200,"body":"Ends Mapped"});
    }
    else{
        endBuildDefer.reject({"status":404,"body":"Ends Not Found"});
    }
    return endBuildDefer.promise;
}

var orgatewaysMapper = function(){
    var orBuildDefer = Q.defer();
    if(procbuild && bpmn["bpmn:exclusiveGateway"]){
        orgateways = bpmn['bpmn:exclusiveGateway'];
        orBuildDefer.resolve({"status":200,"body":"Exclusive Gateways Mapped"});
    }
    else{
        orBuildDefer.reject({"status":404,"body":"Exclusive Gateways Not Found"});
    }
    return orBuildDefer.promise;
}

var andgatewaysMapper = function(){
     var andBuildDefer = Q.defer();
    if(procbuild && bpmn["bpmn:inclusiveGateway"]){
        andgateways = bpmn['bpmn:inclusiveGateway'];
        andBuildDefer.resolve({"status":200,"body":"Parallel Gateways Mapped"});
    }
    else{
        andBuildDefer.reject({"status":404,"body":"Parallel Gateways Not Found"});
    }
    return andBuildDefer.promise;
}

var taskActor = function(obj){

    var actorDefer = Q.defer();
    //console.log("obj: ", obj);
    var id = obj.id;
    var taskid;
    
    if(id.indexOf("SequenceFlow")>-1){
        console.log("It is a sequence");
        taskid = obj.targetRef;
        console.log("new taskid: ", taskid);
    }
    else{
        taskid = id;
    }
    console.log("Task_id: ", taskid);

    for(var i=0;i<actors.length;i++){
        //console.log("Atividades do ator: ", actors[i]["bpmn:flowNodeRef"]);
        if( actors[i]["bpmn:flowNodeRef"].filter( (node) => { return node === taskid } ).length>0 ){
            console.log("Ator: ", actors[i].name);
            actorDefer.resolve({"status":200, "body":actors[i].name});
        }
        else{
            actorDefer.reject({"status":404,"body":"ACTOR UNDEFINED"});
        }
    }

    return actorDefer.promise;

}

var assertiveSentence = function(obj,sent){
    //console.log("Input obj: ", objbpmn);
    var objbpmn = obj;
    var assertiveDefer = Q.defer();
    var sentence = sent; //assertive phrase generated from an unidirectional branch, ends when fork or reach true end
    var actor = ""; //stores the actor responsible for the sentence
    var auxActor = "";
    if( 
        objbpmn.id.indexOf("End")>-1 || objbpmn.id.indexOf("ExclusiveGateway")>-1 || 
        objbpmn.id.indexOf("InclusiveGateway")>-1 || objbpmn.id.indexOf("IntermediateThrowEvent")>-1
      ){ //if the bpmn reached any gateway we shall start a new sentence or end the text
        if( objbpmn.id.indexOf("End")>-1 || objbpmn.id.indexOf("IntermediateThrowEvent")>-1){
            sentence += ", finally ending the bpmn.";
        }
        else if(objbpmn.id.indexOf("ExclusiveGateway")>-1){
            sentence += ", now our bpmn will follow one of these branhces: \n";
        }
        else{
            sentence += ", now our bpmn will execute all these branches in parallel: \n";
        }
        console.log("Acabou !!");
        assertiveDefer.resolve({"status":200,"body":sentence});
    }
    else{
        if( objbpmn.id.indexOf("Task")>-1 ){ //if the task is among the others
            //console.log("Eh uma task !! ", objbpmn);
            var taskText = objbpmn.name; //brings the task action
            
            taskActor(objbpmn)
            .then(function(data){ //brings the author of the task
                var interDefer = Q.defer();
                auxActor = actor;
                actor = data.body;
                interDefer.resolve({"status":200,"body":data.body});
                return interDefer.promise;
            })
            .then(function(data){
                console.log("From actor function: ", data.body);
                var inter2defer = Q.defer();
                if(sentence == ""){ //First mention
                    sentence += "The " + data.body + " " + taskText; //the then particle will come from arrows not from tasks
                    inter2defer.resolve({"status":200,"body":sentence});
                }
                else{ //if a new actor is introduced
                    if(sentence.indexOf(data.body)>-1){ //if the new actor has the same name
                        sentence += " , our actor " + taskText;
                        inter2defer.resolve({"status":200,"body":sentence});
                    }
                    else{//if there is a new actor
                        sentence += ".\nNow, the " + data.body + " " + taskText;
                        inter2defer.resolve({"status":200,"body":sentence});
                    }
                }
                return inter2defer.promise;
            })
            .then(function(data){
                console.log("data: ", data);
                console.log("Sentence: ", data.body);
                console.log("Next: ", flows.filter( (flow) => { return flow.id === objbpmn["bpmn:outgoing"] })[0] );
                console.log("------------------------------------------------------------------------------------");
                assertiveSentence( flows.filter( (flow) => { return flow.id === objbpmn["bpmn:outgoing"] } )[0] ,data.body);
            });

        }
        else{
            var arrowText;
            console.log(0);

            if(objbpmn.name){ //if the arrow has any written thing in it ...
                console.log(1);
                arrowText = objbpmn.name;
                taskActor(objbpmn)            
                .then(function(data){ //brings the author of the task
                    console.log("data: ",data);
                    console.log(3);    
                    var inter1Defer = Q.defer();
                    auxActor = actor;
                    actor = data.body;
                    inter1Defer.resolve({"status":200,"body":data.body});
                    return inter1Defer.promise;
                })
                .then(function(data){
                console.log("From actor function: ", data.body);
                console.log("Sentence: ", sentence);
                var inter2defer = Q.defer();
                    if(sentence == ""){ //First mention
                        sentence += "The " + data.body + " " + taskText; //the then particle will come from arrows not from tasks
                        sentence += arrowText;
                        inter2defer.resolve({"status":200,"body":sentence});
                    }
                    else{ //if a new actor is introduced
                        if(sentence.indexOf(data.body)>-1){ //if the new actor has the same name
                            sentence += " , our actor " + taskText;
                            sentence += arrowText;
                            inter2defer.resolve({"status":200,"body":sentence});
                        }
                        else{//if there is a new actor
                            sentence += ".\nNow, the " + data.body + " " + taskText;
                            sentence += arrowText;
                            inter2defer.resolve({"status":200,"body":sentence});
                        }
                    }
                    return inter2defer.promise;
                })
                .then(function(data){
                    console.log("data: ", data);
                    console.log("Sentence: ", data.body);
                    console.log("Next: ", tasks.filter( (task) => { return task.id === objbpmn["bpmn:targetRef"] } ));
                    console.log("------------------------------------------------------------------------------------");
                    assertiveSentence( tasks.filter( (task) => { return task.id === objbpmn["bpmn:targetRef"] } )[0] ,data.body);
                });
            }
            else{
                console.log(2);
                arrowText = ", then";
                taskActor(objbpmn)            
                .then(function(data){ //brings the author of the task
                    console.log("data: ",data);
                    console.log(3);    
                    var inter1Defer = Q.defer();
                    auxActor = actor;
                    actor = data.body;
                    inter1Defer.resolve({"status":200,"body":data.body});
                    return inter1Defer.promise;
                })
                .then(function(data){
                console.log("From actor function: ", data.body);
                console.log("Sentence: ", sentence);
                var inter2defer = Q.defer();
                    if(sentence == ""){ //First mention
                        sentence += "The " + data.body + " " + taskText; //the then particle will come from arrows not from tasks
                        sentence += arrowText;
                        inter2defer.resolve({"status":200,"body":sentence});
                    }
                    else{ //if a new actor is introduced
                        if(sentence.indexOf(data.body)>-1){ //if the new actor has the same name
                            sentence += " , our actor " + taskText;
                            sentence += arrowText;
                            inter2defer.resolve({"status":200,"body":sentence});
                        }
                        else{//if there is a new actor
                            sentence += ".\nNow, the " + data.body + " " + taskText;
                            sentence += arrowText;
                            inter2defer.resolve({"status":200,"body":sentence});
                        }
                    }
                    return inter2defer.promise;
                })
                .then(function(data){
                    console.log("data: ", data);
                    console.log("Sentence: ", data.body);
                    console.log("Next: ", tasks.filter( (task) => { return task.id === objbpmn["bpmn:targetRef"] } ));
                    console.log("------------------------------------------------------------------------------------");
                    assertiveSentence( tasks.filter( (task) => { return task.id === objbpmn["bpmn:targetRef"] } )[0] ,data.body);
                });
            }
            
        }

    }

    return assertiveDefer.promise;//will return the assertive sentence when bpmning is over.
}

var construct = function(bpmn){//start the engines
    var constructDefer = Q.defer();
    var msg = {};
    //execute all mappers and resolves the promises with an "invoice" of the mapping bpmn
    setTimeout(function(){
        bpmnBuilder(bpmn).then(function(data){msg.bpmnStatus=data.body;});
    },1000);
    setTimeout(function(){
        actorsMapper().then(function(data){msg.actorsStatus=data.body;});
        tasksMapper().then(function(data){msg.tasksStatus=data.body;});
        flowsMapper().then(function(data){msg.flowsStatus=data.body;});
        startMapper().then(function(data){msg.startStatus=data.body;});
        endMapper().then(function(data){msg.endsStatus=data.body;});    
        orgatewaysMapper().then(function(data){msg.exclusiveGatewaysStatus=data.body;});
        andgatewaysMapper().then(function(data){msg.parallelGatewaysStatus=data.body;});
    },2000) 
    setTimeout(function(){constructDefer.resolve({"status":200,"body":msg});},3000);
    return constructDefer.promise;
}

construct(exemplo.body)
.then(function(data){
    console.log("Invoice: ",data);
    console.log("------------------------------------------------------------------------------------");
    //console.log("Flows: ", flows);
    
    var first_arrow = flows.filter( (flow) => { return flow.id === start["bpmn:outgoing"]} );
    first_arrow = first_arrow[0];
    //console.log("First Arrow: ", first_arrow);

    if( first_arrow.targetRef.indexOf("ExclusiveGateway") >-1 ){
        //console.log("OR gateway");
        var target = orgateways.filter( (gate) => {return gate.id === first_arrow.targetRef} )[0]["bpmn:outgoing"];
        //console.log("Correct target:", target);
        
        first_arrow = flows.filter( (flow) => { return flow.id === target; })[0];
    }
    if( first_arrow.targetRef.indexOf("InclusiveGateway") >-1 ){
        //console.log("AND gateway");
        var target = andgateways.filter( (gate) => {return gate.id === first_arrow.targetRef} )[0]["bpmn:outgoing"];
        //console.log("Correct target:", target);
        
        first_arrow = flows.filter( (flow) => { return flow.id === target; })[0];
    }

    //console.log("First Arrow: ", first_arrow);

    var first_task = tasks.filter( (task) => { return task.id === first_arrow.targetRef});
    //console.log("First Task: ", first_task);
    
    var beggining = first_task;
    //console.log("Beginning: ", beggining[0]);

    assertiveSentence(beggining[0],"").then(function(data){
        console.log("Text: ", data);
    });
});
