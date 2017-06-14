'use strict';

var rabbit = require('replay-rabbitmq'),
    queues = {};

exports.createJob = function(qName, data, options) {
    rabbit.produce(qName, data, options);
};

// exports.createJob = function(qName, data) {
//     if (!queues[qName]) queues[qName] = require('../providers/busmq').get(qName);
//     console.log('************ createJob ****************', qName);
//     queues[qName].push(data);
// };