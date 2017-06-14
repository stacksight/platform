'use strict';

var stacks = require('../controllers/stacks'),
    users = require('../controllers/users'),
    _ = require('lodash'),
    statusTypes = {
        critical: [1],
        available: [2, 3, 4, 5]
    },
    config = require(process.cwd() + '/config'),
    notifyService = require('../services/notify'),
    async = require('async'),
    mongoose = require('mongoose'),
    Notification = mongoose.model('Notification');

//TODO : MOVE IT TO BE GENERIC FOR ALL OBSERVERS, NOT ONLY UPDATES - ASAP

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    stacks._stack(message.data.appId, function(err, stack, app) {

        if (err) {
            error();
            return console.error('UPDATES OBSERVER ERR1', err);
        }

        var integration = _.find(stack.integrations, function(o) {
            return o.name === 'updates';
        });

        var statusCnt = _.countBy(message.data.data, function(o) {
            return o.status
        });

        var data = {
            name: 'updates',
            index: 'updates',
            type: 'update',
            updated: new Date(),
            data: {
                critical: _.reduce(_.pick(statusCnt, statusTypes.critical), function(sum, n) {
                    return sum + n;
                }, 0),
                available: _.reduce(_.pick(statusCnt, statusTypes.available), function(sum, n) {
                    return sum + n;
                }, 0)
            }
        };


        integration = (integration) ? _.extend(integration, data) : data;

        if (!integration._id) integration = stack.integrations.push(integration);

        if (data.data.critical === 0 || !stack.company) return done();

        async.parallel({
            update: function(callback) {
                stacks._update(stack, function(err, doc) {
                    callback(err, doc);
                });
            },
            notify: function(callback) {

                users.getCollaborators(stack, 'updates', function(err, _data) {

                    if (err) return callback(err);

                    var locals = {
                        critical: data.data.critical,
                        available: data.data.available,
                        updated: data.updated,
                        app: app.name,
                        stack: stack.name,
                        link: config.dashboardHost + '/#!/stack/' + stack._id + '/updates'
                    };

                    if (_data.email) {
                        for (var index in _data.email) {
                            _data.email[index].forEach(function(email) {
                                var notification = new Notification({
                                    to: email,
                                    stack: stack._id,
                                    stackName: stack.name,
                                    type: 'updates',
                                    tpl: 'updates',
                                    locals: locals,
                                    frequency: index
                                });
                                notification.save();
                            });
                        }
                    }

                    var obj = {};
                    // obj.email = (_data.email && _data.email.immediate) ? {
                    //     to: _data.email.immediate,
                    //     locals: locals,
                    //     tpl: 'updates',
                    //     subject: 'Critical updates'
                    // } : null;
                    obj.pushNotification = {
                        users: _data.pushNotification,
                        alert: 'Critical update'
                    };

                    obj.slack = {
                        users: _data.slack,
                        message: locals.app + '/' + locals.stack + ' has ' + locals.critical + ' critical updates. if you like your job you should probably go to <' + locals.link + '|here> and update it.'
                    };

                    for (var key in _data) {
                        if (notifyService.notify[key] && obj[key]) notifyService.notify[key](obj[key]);
                    }

                    callback(null);
                });

            }
        }, function(err, results) {
            if (err) {
                console.log('UPDATES OBSERVER ERR2', err);
                return error();
            }
            done();
        });
    }, true);
}