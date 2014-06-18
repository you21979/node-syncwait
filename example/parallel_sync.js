"use strict"
var fs = require('fs');
var SyncWait = require('../lib/syncwait');

var test1 = function(callback){
    var sw = new SyncWait();
    var read = sw.bind(fs.readFile, fs);
    var contents = {};
    read('../lib/syncwait.js', 'utf-8', function(err, val){
        if(err) return;
        contents['syncwait'] = val;
    });
    read('../README.md', 'utf-8', function(err, val){
        if(err) return;
        contents['readme'] = val;
    });
    read('hoge', 'utf-8');
    read('../README.md');
    sw.fail(console.log);
    sw.catch(function(err){
        callback(err);
    });
    sw.done(function(data){
        if(sw.max() === data.length){
            console.log('test1 all done');
        }else{
            console.log('test1 %s error %s success done', sw.max() - data.length, data.length);
        }
        callback(null, contents);
    });
}
var test2 = function(files, callback){
    var sw = new SyncWait();
    var read = sw.bind(fs.readFile, fs);
    files.forEach(function(f){
        read(f, 'utf-8');
    });
    sw.fail(console.log);
    sw.catch(function(err){
        callback(err);
    });
    sw.done(function(data){
        if(sw.max() === data.length){
            console.log('test2 all done');
        }else{
            console.log('test2 %s error %s success done', sw.max() - data.length, data.length);
        }
        callback(null, data);
    });
}

test1(function(err, contents){
    console.log('test1 end');
});
test2(['../lib/syncwait.js', '../README.md'], function(err, contents){
    console.log('test2 end');
});
