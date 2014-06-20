"use strict"
var util = require("util");
var domain = require('domain');                                                                                                              
var SyncWait = module.exports = function(){
    this.count = 0;
    this._max = 0;
    this.items = [];
    this.isReturned = false;
    this.callbackDone = function(){};
    this.callbackFail = function(){};
    this.callbackCatch = function(){};
}
SyncWait.prototype.bind = function(asyncfunc, instance, num){
    var d = domain.create();
    var self = this;
    d.on('error',function(err){
        if(!self.isReturned){
            self.isReturned = true;
            self.callbackCatch(err);
        }
    });
    return d.bind(function(){
        var arg = arguments;
        setImmediate(function(){
            var callback = arg[arg.length-1];
            if(callback instanceof Function){
                arg[arg.length - 1] = function(){
                    callback.apply(null, arguments);
                    self.leave.apply(self, arguments);
                }
            }else{
                arg[arg.length] = function(){
                    self.leave.apply(self, arguments);
                }
                arg.length++;
            }
            self.enter(num);
            asyncfunc.apply(instance, arg);
        });
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
            if(!self.isReturned){
                self.isReturned = true;
                self.callbackDone(self.items);
            }
        }
    });
}
SyncWait.prototype.max = function(){
    return this._max;
}
SyncWait.prototype.catch = function(callback){
    this.callbackCatch = callback;
}
SyncWait.prototype.done = function(callback){
    this.callbackDone = callback;
}
SyncWait.prototype.fail = function(callback){
    this.callbackFail = callback;
}
