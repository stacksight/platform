'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    Stack = mongoose.model('Stack'),
    App = mongoose.model('App'),
    apps = require('./apps'),
    stacks = require('./stacks'),
    elastic = require('./elastic'),
    requireFields = ['domain', 'token'],
    Global = require('../services/global'),
    urlpattern = Global.urlpattern,
    producer = require('../producers');


exports.create = function(message, user, cb) {

    var appId = message.data.appId;
    var err;

    if (!appId)
        requireFields.forEach(function(field) {
            if (!message.data[field]) {
                err = '========== required field ' + field + ' is missing =========';
            }
        });

    if (err) return cb(err);

    var query = {};
    query['$and'] = [];
    query['$and'].push({
        $or: [{
            author: user._id
        }, {
            owner: user._id
        }]
    });
    if (appId)
        query['$and'].push({
            _id: appId
        });
    else
        query['$and'].push({
            domain: message.data.domain
        });

    Stack.findOne(query).exec(function(err, stack) {

        if (err) {
            console.error('========== CREATE-STACK-STS FIND STACK ERR =======', err);
            return cb(err);
        }

        if (!stack) return cb('Stack doesn\'t exist or maybe you do not have permissions. check the appId again. (user: ' + user.name + ', appId: ' + appId + ', domain: ' + message.data.domain + ')');

        if (message.data.platform && stack.platform !== message.data.platform) {
            stack.platform = message.data.platform;
            stacks._update(stack, function(err, doc) {
                if (err) console.error('=========== UPDATE STACK PLATFORM ERR ================', err);
            });
        }

        message.data.platform = stack.platform; //for extensions data (calculatedId)

        return cb(null, {
            appId: stack._id
        });
    });
};