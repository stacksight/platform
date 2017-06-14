'use strict';

var config = require(process.cwd() + '/config');
var Bus = require('busmq');
var bus = Bus.create({
    redis: config.redis
});

var queues = [{
    name: 'index-sts',
    requires: ['../consumers/index-elastic']
}, {
    name: 'crons-sts',
    requires: ['../consumers/crons']
}, {
    name: 'performance-sts',
    requires: [ /*'../consumers/performance'*/ ]
}, {
    name: 'updates-observer-sts',
    requires: ['../observers/updates']
}, {
    name: 'events-observer-sts',
    requires: ['../observers/events']
}, {
    name: 'accessibility-sts',
    requires: [ /*'../consumers/accessibility'*/ ]
}, {
    name: 'availability-sts',
    requires: [/*'../consumers/availability'*/]
}, {
    name: 'reindex-sts',
    requires: ['../consumers/reindex']
}, {
    name: 'translation-sts',
    requires: ['../consumers/translation']
}, {
    name: 'apps-aggregations-sts',
    requires: ['../consumers/apps-aggregations']
}, {
    name: 'app-aggregation-sts',
    requires: ['../consumers/app-aggregation']
}, {
    name: 'stack-group-sts',
    requires: ['../consumers/stack-group']
}, {
    name: 'logs-observer-sts',
    requires: ['../observers/logs']
}, {
    name: 'integrations-platform-observer-sts',
    requires: ['../observers/platform-sh']
}];

bus.on('error', function(err) {
    console.error('=========== BUS CONNECTION ERROR =============', err);
});

bus.on('online', function() {
    queues.forEach(function(queue, index) {
        queue.val = bus.queue(queue.name);
        queue.val.on('attached', function() {
            console.log('attached to queue ' + queue.name);
            requirements(queue.requires);
        });
        queue.val.attach();
    });
});

function requirements(requires) {
    requires.forEach(function(r) {
        require(r);
    });
};


bus.on('offline', function() {
    console.error('bus offline - redis down');
});

// connect the redis instances
bus.connect();

exports.get = function(name) {
    var queue;
    for (var i = 0; i < queues.length; i++) {
        if (queues[i].name === name) {
            queue = queues[i];
            break;
        }
    };
    return queue.val;
};
