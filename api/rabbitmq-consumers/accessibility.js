'use strict';

var pa11y = require('pa11y');
var elastic = require('../controllers/elastic');

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    var test = pa11y({});
    test.run(message.url, function(err, results) {
        if (err) {
            error(err);
            return console.error('================ Accessibility Error ====================', err);
        }
        if (!results || !results.length) return done();

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

        done();

    });
};