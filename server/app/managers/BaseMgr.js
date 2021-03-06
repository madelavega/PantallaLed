var Q = require('q'),
    util = require('util');

function BaseMgr() {
}

util.inherits(BaseMgr, require('events').EventEmitter);

//parse messages from websockets connection
BaseMgr.prototype.handleMessage = function (messageType) {
    "use strict";
    var message = messageType.split("/"), matchedProperty, messages = this.messages;
    message = message[message.length - 1];

    //return the closure to execute the manager method
    return function (data) {
        var d = Q.defer(), doBroadCasting;
        //the matched property in manager messages
        matchedProperty = messages[message];

        //check if it would be broadcasting when finish
        doBroadCasting = matchedProperty.doBroadCasting;

        //the matched function will be execute with the data passed in the closure.
        if (matchedProperty.promise) {
            matchedProperty.fn(data).then(function (result) {
                d.resolve({doBroadCasting: doBroadCasting, data: result});
            });
        } else {
            d.resolve({doBroadCasting: doBroadCasting, data: matchedProperty.fn(data)});
        }
        return d.promise;
    };
};

module.exports = BaseMgr;