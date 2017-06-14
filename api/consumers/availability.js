'use strict';


var q = require('../providers/busmq').get('availability-sts');
q.consume();

var request = require('request'),
    config = require('../config'),
    mongoose = require('mongoose'),
    Stack = mongoose.model('Stack'),
    uptimeHost = config.uptimeHost;

q.on('message', function(message) {
    message = JSON.parse(message);

    var objReq = {
        uri: uptimeHost + '/dashboard/checks',
        method: 'POST',
        form: {
            check: {
                url: message.url,
                name: message.url,
                interval: 60,
                maxTime: 1500,
                alertTreshold: 1,
                tags: ['from api']
            }
        },
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };

    request(objReq, function(error, response, body) {
        if (!error && response.statusCode < 400 && response.body.length) {
            console.log(JSON.parse(body));
            var check = JSON.parse(body);
            Stack.findOneAndUpdate({
                _id: message.appId
            }, {
                $set: {
                    check: check._id
                }
            }, function(err, stack) {
                if (err) return console.log(' =============== MONGO SAVE CHECK ERR ================= ', err);
                console.log('========== MONGO SAVE CHECK SUCCESS =================');
            });
            console.log('@@@@@@@@ CREATE CHECK SUCCESS @@@@@@@@@@@@@@@@', response.statusCode);
        } else {
            console.error('@@@@@@@@ CREATE CHECK ERROR @@@@@@@@@@@@@@@@', error);
        }
    });
});
