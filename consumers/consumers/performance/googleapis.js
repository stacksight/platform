'use strict';

var q = require('../../providers/busmq').get('performance-sts');
q.consume();

// q.flush();

var elastic = require('../../controllers/elastic');
var google = require('googleapis');
var pagespeedonline = google.pagespeedonline('v2');

var params = {
    screenshot: true
};

var strategies = ['desktop', 'mobile'];

q.on('message', function(message) {
    message = JSON.parse(message);
    q.stop();
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


    var cntStrategies = 0;

    strategies.forEach(function(s) {
        params.strategy = s;
        pagespeedonline.pagespeedapi.runpagespeed(params, function(err, response) {
            if (err) {
                q.consume();
                return console.log('======== GOOGLEPAGESPEED DESKTOP ERROR ==============', err, message.url);
            }
            message.data[0].widgets[0].data[s].data = response;
            cntStrategies++;
            if (cntStrategies === strategies.length) {
                q.consume();
                elastic._index('health', 'performance', message);
            }
        });
    });
});
