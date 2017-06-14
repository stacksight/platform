'use strict';


var mails = require('../providers/mails'),
    config = require(process.cwd() + '/config'),
    ionicPushServer = require('ionic-push-server'),
    request = require('request'),
    _ = require('lodash'),
    credentials = {
        IonicApplicationID: config.ionic.appId,
        IonicApplicationAPIsecret: config.ionic.appSecretKey
    };

exports.notify = {
    email: function(data, cb) {
        mails.send(data.tpl, {
            to: data.to,
            subject: data.subject,
            locals: data.locals
        }, cb);
    },
    pushNotification: function(data) {
        var notification = {
            'user_ids': [data.users],
            'notification': {
                "alert": data.alert,
                "ios": {
                    "badge": 1,
                    "sound": "chime.aiff",
                    "expiry": 1423238641,
                    "priority": 10,
                    "contentAvailable": true,
                    "payload": {
                        "key1": "value",
                        "key2": "value"
                    }
                },
                "android": {
                    "collapseKey": "foo",
                    "delayWhileIdle": true,
                    "timeToLive": 300,
                    "payload": {
                        "key1": "value",
                        "key2": "value"
                    }
                }
            }
        };

        ionicPushServer(credentials, notification);
    },
    slack: function(data) {

        if (!_.isArray(data.users)) data.users = [data.users];
        data.users.forEach(function(user) {
            var form = 'payload={"channel": "' + user.channel + '", "username": "stacksight", "text": " ' + data.message + '", "icon_emoji": ":ghost:"}';
            var objReq = {
                uri: user.url,
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                form: form
            };

            request(objReq, function(error, response, body) {
                console[(error) ? 'error' : 'log']('SLACK REPOSONSE ERROR/BODY', error, body);
            });
        });
    }
};
