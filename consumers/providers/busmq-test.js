'use strict';

var config = require(process.cwd() + '/config'),
    Bus = require('busmq'),
    fPath = config.federationServer.path,
    options = {
        federate: { // connect to a federate bus 
            poolSize: 5, // keep the pool size with 5 web sockets 
            urls: [fPath], // pre-connect to these urls, 5 web sockets to each url 
            secret: config.federationServer.secret // the secret ket to authorize with the federation server 
        }
    },
    bus = Bus.create(options);

var queues = [{
    name: 'translation-sts',
    requires: []
}, {
    name: 'accessibility-sts',
    requires: ['../consumers/accessibility/pally']
}, {
    name: 'performance-sts',
    requires: ['../consumers/performance/googleapis']
}];


bus.on('online', function() {
    console.log('BUS ONLINE');
    queues.forEach(function(queue, index) {
        queue.fed = bus.federate(bus.queue(queue.name), fPath);
        queue.fed.on('ready', function(q) {
            console.log('FED OF ' + queue.name + ' IS READY');
            queue.val = q;

            // federation is ready - we can start using the queue 
            queue.val.on('attached', function() {
                console.log('Q ' + queue.name + ' IS ATTACHED');
                requirements(queue.requires);
            });
            queue.val.attach();
        });
    });
});

bus.on('offline', function() {
    console.log('bus offline - redis down');
});

function requirements(requires) {
    requires.forEach(function(r) {
        require(r);
    });
};

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


bus.connect();