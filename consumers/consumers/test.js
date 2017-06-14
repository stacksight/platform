'use strict';

var q = require('../providers/busmq-test').get('test-sts');
q.consume();

// q.flush();



q.on('message', function(message, id) {
    console.log('message is called from consumers machine', message, id);
});