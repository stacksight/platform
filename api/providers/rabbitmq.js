'use strict';

var config = require(process.cwd() + '/config'),
    rabbit = require('replay-rabbitmq'),
    ENV = process.env.NODE_ENV;

var envRequires = {
    accessibility: (ENV === 'production') ? [] : ['../rabbitmq-consumers/accessibility'],
    performance: (ENV === 'production') ? [] : ['../rabbitmq-consumers/performance']
};

var queues = [{
    name: 'index-sts',
    requires: ['../rabbitmq-consumers/index-elastic'],
    maxUnackMessages: 50
}, {
    name: 'identify-data-sts',
    requires: ['../rabbitmq-consumers/identify-data'],
    maxUnackMessages: 100
}, {
    name: 'crons-sts',
    requires: ['../rabbitmq-consumers/crons'],
    maxUnackMessages: 200
}, {
    name: 'performance-sts',
    requires: envRequires['performance'],
    maxUnackMessages: 10
}, {
    name: 'updates-observer-sts',
    requires: ['../rabbitmq-observers/updates'],
    maxUnackMessages: 100
}, {
    name: 'events-observer-sts',
    requires: ['../rabbitmq-observers/events'],
    maxUnackMessages: 100
}, {
    name: 'accessibility-sts',
    requires: envRequires['accessibility'],
    maxUnackMessages: 10
}, {
    name: 'availability-sts',
    requires: [ /*'../rabbitmq-consumers/availability'*/ ],
    maxUnackMessages: 50
}, {
    name: 'reindex-sts', // full with health data
    requires: [/*'../rabbitmq-consumers/reindex'*/],
    maxUnackMessages: 1,
    noAck: false
}, {
    name: 'reindex-1-sts',
    requires: ['../rabbitmq-consumers/reindex'],
    maxUnackMessages: 1,
    noAck: false
}, {
    name: 'translation-sts',
    requires: ['../rabbitmq-consumers/translation'],
    maxUnackMessages: 100
}, {
    name: 'apps-aggregations-sts',
    requires: ['../rabbitmq-consumers/apps-aggregations'],
    maxUnackMessages: 200
}, {
    name: 'app-aggregation-sts',
    requires: ['../rabbitmq-consumers/app-aggregation'],
    maxUnackMessages: 10
}, {
    name: 'stack-group-sts',
    requires: ['../rabbitmq-consumers/stack-group'],
    maxUnackMessages: 100
}, {
    name: 'logs-observer-sts',
    requires: ['../rabbitmq-observers/logs'],
    maxUnackMessages: 100
}, {
    name: 'integrations-platform-observer-sts',
    requires: ['../rabbitmq-observers/platform-sh'],
    maxUnackMessages: 100
}, {
    name: 'stack-aggregation-sts',
    requires: ['../rabbitmq-consumers/stack-aggregation'],
    maxUnackMessages: 10
}, {
    name: 'health-observer-sts',
    requires: ['../rabbitmq-observers/health'],
    maxUnackMessages: 10
}, {
    name: 'collaborators-sts',
    requires: ['../rabbitmq-consumers/collaborators'],
    maxUnackMessages: 1
}, {
    name: 'delete-indices-sts',
    requires: ['../rabbitmq-consumers/delete-indices'],
    maxUnackMessages: 5
}, {
    name: 'ssl-validity-sts',
    requires: ['../rabbitmq-consumers/ssl-validity'],
    maxUnackMessages: 4
}, {
    name: 'user-notifications-sts',
    requires: ['../rabbitmq-consumers/user-notifications'],
    maxUnackMessages: 50
}];

function init() {
    connectRabbitMQ()
        .then(function (err) {
            console.log('connectRabbitMQ Err:', err);

            queues.forEach(function (queue, index) {
                queue.requires.forEach(function (r) {
                    require(r)(rabbit, queue);
                });
            });
        });
}

init();


function connectRabbitMQ() {
    var host = (config.rabbitmq && config.rabbitmq.host) ? config.rabbitmq.host : 'localhost';
    return rabbit.connect(host);
}

rabbit.eventEmitter.on('channel.close', function (err) {
    init();
});