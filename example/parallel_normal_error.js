"use strict"
var SyncWait = require('../lib/syncwait');

var test = function(callback){
    var sw = new SyncWait();
    var tasks = [
        function(c){c(new Error('aaa'))},// callback error
        function(c){c(null, 0)}, // success
        function(c){setTimeout(function(){c(null, 1)}, 1000)}, // async success
        function(c){setTimeout(function(){c(new Error('bbb'))}, 1000)}, // async success
        function(c){c(null, 3)} // success
    ];
    tasks.forEach(function(f){
        sw.bind(f)(console.log);
    });
    sw.done(function(list){
        console.log('err count:%d', sw.max() - list.length);
        console.log('success count:%d', list.length);
        callback();
    });
}
var domain = require('domain');
var main = function(callback){
    var flag = false;
    var d = domain.create();
    d.on('error', function(err){
        if(!flag){
            callback(err);
            flag = true;
        }
    });
    var f = d.bind(test);
    f(function(){
        // object change timing
        callback(null);
    });
}
main(function(err){
    if(err) console.log('error');
    else console.log('ok');
});