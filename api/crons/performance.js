'use strict';

var mongoose = require('mongoose'),
    Stack = mongoose.model('Stack'),
    producer = require('../producers'),
    urlpattern = /^https?:\/\//;

module.exports = function(message, error, done) {
    var query = {
        host: {
            $exists: true,
            $ne: null
        }
    };
    if (message.params.stackId) query['_id'] = message.params.stackId;

    Stack.find(query).exec(function(err, stacks) {
        if (err) {
            (error || Function)(err);
            return console.error('======= PERFORMANCE SEARCH STACKS ERR ==============================', err);
        }
        var stack;
        (done || Function)();
        (function pLoop(i) {
            setTimeout(function() {
                stack = stacks[i - 1];
                var data = {
                    appId: stack._id,
                    mngToken: stack.owner,
                    url: urlpattern.test(stack.host) ? (stack.host) : 'http://' + stack.host
                };
                producer.createJob('performance-sts', data);
                if (--i) pLoop(i);
            }, 1000)
        })(stacks.length);
    });
};
