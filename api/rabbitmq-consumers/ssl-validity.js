'use strict';

var https = require('https'),
    SSL = require('../integrations/scans/classes/ssl'),
    request = require('request');


module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    done();

    var req = 'http://13.95.226.226:8000/?url=' + message.url;
    request(req, function(_error, response, body) {
        if (response && response.statusCode == 200) {
            body = JSON.parse(body);

            var options = {
                params: {
                    appId: message.appId,
                    mngToken: message.mngToken
                }
            };
            var data = {
                data: body
            };

            var integration = new SSL(data, 'scan', 'node_ssl_validity', 'signal', options);
        } 
        // Catch various 500 errors
        else if (response) {
            console.log('UNKNOWN SSL VALIDITY ERROR 1 for ' + message.url, _error, body);
        }
        /* 
        We think that sometimes the request to the verify-ssl service
        before the service itself sends the response res.end()
        in such case, there will be no response object 
        */
        else if (!response) {
            console.log('UNKNOWN SSL VALIDITY ERROR 2 for ' + message.url, _error, body);
        }
    });
};