'use strict';


var q = require('../providers/busmq').get('stack-group-sts');
q.consume();

var mongoose = require('mongoose'),
    App = mongoose.model('App'),
    apps = require('../controllers/apps'),
    stacks = require('../controllers/stacks'),
    async = require('async');

q.on('message', function(message) {
    message = JSON.parse(message);
    async.waterfall([
        async.apply(findApp, message),
        createApp,
        updateStackApp
    ], function(err, result) {
        console.log('=========================================================');
        console[(err) ? 'error' : 'log'](err, result);
        console.log('=========================================================');

    });
});


function findApp(message, callback) {

    App.findOne({
        name: message.group,
        author: message.user._id
    }).exec(function(err, app) {
        if (err) return callback(err);
        if (app) {
            if ((message.stack.app && app._id.toString() === message.stack.app.toString()) || !message.stack.app) {
                // check if stack exists in app.stacks array
                if (app.stacks.indexOf(message.stack._id) === -1) {
                    apps.addExistingStack(message.user, { appId: app._id, stackId: message.stack._id }, function() {});
                }
                return callback('group id is ' + app._id);
            }           
            return callback(null, message, app);
        }                                                                                           

        callback(null, message, null);
    });
}

function createApp(message, app, callback) {
    if (app) return callback(null, message, app);

    var data = {};
    data.name = message.group;

    apps._create(message.user, data, function(data) {
        if (!data.success && !data.app) {
            console.log('======== CREATE-STACK-STS FIND APP ERR ==========', data.msg);
            return callback(data.msg);
        }

        if (!data.app) return callback('App (group) is missing');

        callback(null, message, data.app);
    });
}

function updateStackApp(message, app, callback) {

    stacks._stack(message.stack._id, function(err, stack, fromApp) {
        if (err) return callback(err);
        var data = {};
        data.stack = stack;
        data.user = message.user;
        data.from = fromApp._id;
        data.to = app._id;

        stacks._relocation(data, function(err, data) {
            if (err) return callback(err.msg);
            callback(null, data);
        });
    });

}
