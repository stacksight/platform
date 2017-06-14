'use strict';

var queues = {};
exports.createJob = function(qName, data) {
    if (!queues[qName]) queues[qName] = require('./busmq').get(qName);
    console.log('************ createJob ****************', qName);
    queues[qName].push(data);
};
