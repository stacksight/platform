'use strict';

var mongoose = require('mongoose'),
    App = mongoose.model('App'),
    apps = require('../controllers/apps'),
    stacks = require('../controllers/stacks'),
    async = require('async');

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {
    //message contains:  { stack: stack, user: user, group: group }
    async.waterfall([
        async.apply(findApp, message),
        createApp,
        updateStackApp
    ], function(err, result) {
        console.log('============= STACK GROUP CONSUMER ======================');
        console[(err) ? 'error' : 'log'](err, result);
        console.log('=========================================================');
        if (err && err.real) return error(err.msg);
        done();

    });
};


function findApp(message, callback) {

    App.findOne({
        name: message.group,
        author: message.user._id
    }).exec(function(err, app) {
        if (err) return callback({real: true, msg: err});
        if (app) {
            if ((message.stack.app && app._id.toString() === message.stack.app.toString()) || !message.stack.app) {
                // check if stack exists in app.stacks array
                if (app.stacks.indexOf(message.stack._id) === -1) {
                    apps.addExistingStack(message.user, { appId: app._id, stackId: message.stack._id }, function() {});
                }
                return callback({ real: false, msg: 'group id is ' + app._id });
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
            return callback({real: true, msg: data.msg});
        }

        if (!data.app) return callback({real: true, msg: 'App (group) is missing'});

        callback(null, message, data.app);
    });
}

function updateStackApp(message, app, callback) {

    stacks._stack(message.stack._id, function(err, stack, fromApp) {
        if (err) return callback({real: true, msg: err});
        var data = {};
        data.stack = stack;
        data.user = message.user;
        data.from = fromApp._id;
        data.to = app._id;

        stacks._relocation(data, function(err, data) {
            if (err) return callback({real: true, msg: err.msg});
            callback(null, data);
        });
    });

}
