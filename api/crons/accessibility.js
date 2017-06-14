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
            return console.error('======= ACCESSIBILITY SEARCH STACKS ERR ==============================', err);
        }

        stacks.forEach(function(stack) {
            var data = {
                appId: stack._id,
                mngToken: stack.owner,
                url: urlpattern.test(stack.host) ? (stack.host) : 'http://' + stack.host
            };
            producer.createJob('accessibility-sts', data);
        });
        (done || Function)();
    });
};
