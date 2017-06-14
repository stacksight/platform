'use strict';


var q = require('../providers/busmq').get('test-sts');
q.consume();

q.on('message', function(message) {
    console.log('Q  TEST MESSAGE !!!', message);
});

var q1 = require('../providers/busmq2').get('test-sts');
q1.consume();

q1.on('message', function(message) {
    console.log('Q1 TEST MESSAGE !!!', message);
});

for (var i=0; i < 3; i ++) {
    q.push({name: 'test-' + i, age: i});
}