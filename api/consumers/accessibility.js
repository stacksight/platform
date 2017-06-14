'use strict';

var pa11y = require('pa11y');
var elastic = require('../controllers/elastic');

var q = require('../providers/busmq').get('accessibility-sts');
q.consume();

q.on('message', function(message) {

    message = JSON.parse(message);
    var test = pa11y({});
    test.run(message.url, function(error, results) {
        if (error) return console.error('================ Accessibility Error ====================', error);
        if (!results || !results.length) return;

        message.data = [{}];
        message.data[0].category = 'accessibility';
        message.data[0].title = 'accessibility';
        message.data[0].tab_title = 'accessibility';
        message.data[0].desc = 'You can do site faster!';

        message.data[0].widgets = [{
            type: 'accessibility',
            title: 'Accessibility',
            desc: 'accessibility',
            group: 1,
            order: 1,
            data: results
        }];
        elastic._index('health', 'accessibility', message);

    });
});