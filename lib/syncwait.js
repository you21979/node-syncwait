"use strict"
var util = require("util");
var SyncWait = module.exports = function(){
    this.count = 0;
    this._max = 0;
    this.items = [];
    this.isDone = false;
    this.callbackDone = function(){};
    this.callbackFail = function(){};
}
SyncWait.prototype.bind = function(asyncfunc, instance, num){
    var self = this;
    return (function(){
        var callback = arguments[arguments.length-1];
        if(callback instanceof Function){
            arguments[arguments.length - 1] = function(err, val){
                callback(err, val);
                self.leave(err, val);
            }
        }else{
            arguments[arguments.length] = function(err, val){
                self.leave(err, val);
            }
            arguments.length++;
        }
        self.enter(num);
//        try{
            asyncfunc.apply(instance, arguments);
//        }catch(e){
//            self.leave(e);
//        }
    });
};
SyncWait.prototype.enter = function(num){
    if(num === undefined){
        num = 1;
    }
    this.count += num;
    this._max += num;
}
SyncWait.prototype.leave = function(err, data){
    var self = this;
    setImmediate(function(){
        --self.count;
        if(err){
            self.callbackFail(err);
        }else{
            self.items.push(data);
        }
        if(self.count < 0){
            console.error(new Error('overcalled').stack);
        }else if(self.count === 0){
            if(!self.isDone){
                self.isDone = true;
                self.callbackDone(self.items);
            }
        }
    });
}
SyncWait.prototype.max = function(callback){
    return this._max;
}
SyncWait.prototype.done = function(callback){
    this.callbackDone = callback;
}
SyncWait.prototype.fail = function(callback){
    this.callbackFail = callback;
}
