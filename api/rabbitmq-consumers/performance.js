'use strict';

var elastic = require('../controllers/elastic');
var google = require('googleapis');
var pagespeedonline = google.pagespeedonline('v2');

var params = {
    screenshot: true
};

var strategies = ['desktop', 'mobile'];

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    params.url = message.url;
    message.data = [{}];
    message.data[0].category = 'performance';
    message.data[0].title = 'performance';
    message.data[0].tab_title = 'performance';
    message.data[0].desc = 'You can do site faster!';

    message.data[0].widgets = [{
        type: 'performance',
        title: 'Your speed test',
        desc: 'Your speed test desc',
        group: 1,
        order: 1,
        data: {
            mobile: {
                title: 'Mobile',
                description: ''
            },
            desktop: {
                title: 'Desktop',
                description: ''
            }
        }
    }];

    var i = 0;

    run();

    function run() {
        if (i === strategies.length) {
            elastic._index('health', 'performance', message);
            return done();
        }
        params.strategy = strategies[i];
        pagespeedonline.pagespeedapi.runpagespeed(params, function(err, response) {
            if (err) {
                console.log('PERFORMANCE ERR', err);
                return error(err);
            }
            message.data[0].widgets[0].data[strategies[i]].data = response;
            i++;
            run();
        });
    }
};
