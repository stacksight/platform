'use strict';

var request = require('request'),
    config = require('../config'),
    mongoose = require('mongoose'),
    Stack = mongoose.model('Stack'),
    uptimeHost = config.uptimeHost;

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

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

    request(objReq, function(err, response, body) {
        if (!err && response.statusCode < 400 && response.body.length) {
            console.log(JSON.parse(body));
            var check = JSON.parse(body);
            Stack.findOneAndUpdate({
                _id: message.appId
            }, {
                $set: {
                    check: check._id
                }
            }, function(err, stack) {
                if (err) {
                    error(err);
                    return console.log(' =============== MONGO SAVE CHECK ERR ================= ', err);
                }
                done();
                console.log('========== MONGO SAVE CHECK SUCCESS =================');
            });
            console.log('@@@@@@@@ CREATE CHECK SUCCESS @@@@@@@@@@@@@@@@', response.statusCode);
        } else {
            error(err);
            console.error('@@@@@@@@ CREATE CHECK ERROR @@@@@@@@@@@@@@@@', err);
        }
    });
};