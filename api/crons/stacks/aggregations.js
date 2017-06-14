'use strict';

var mongoose = require('mongoose'),
    Stack = mongoose.model('Stack'),
    producer = require('../../producers');

module.exports = function(message, error, done) {

    var query;
    query = (message.params.id) ? {_id: message.params.id} : {};

    Stack.find(query).exec(function(err, stacks) {
        if (err) return (error || Function)(err);

        stacks.forEach(function(stack) {
            if (!stack._id || !stack.currentIndex) return;
            producer.createJob('stack-aggregation-sts', {
                id: stack._id,
                index: stack.currentIndex
            });
        });

        (done || Function)();
    });
};