'use strict';

var config = require(process.cwd() + '/config'),
    notifyService = require('../services/notify'),
    stacks = require('../controllers/stacks'),
    users = require('../controllers/users'),
    cp = require('../controllers/configuration-policy'),
    mongoose = require('mongoose'),
    Notification = mongoose.model('Notification');

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    var method = message.data.method;
    if (!method) return done();

    var type = method.toLowerCase();
    cp.allowA('logsNotifications', message.user, type, function(err) {

        if (err) return done(); // error here says that the log type is not allowed to the current plan

        stacks._stack(message.data.appId, function(err, stack, app) {

            if (err) {
                error(err);
                return console.log('LOGS OBSERVER ERR', err);
            }

            users.getCollaborators(stack, ['main:logs', 'logs-' + type], function(err, _data) {
                if (err) {
                    error(err);
                    return console.error('LOGS OBSERVER ERR', err);
                }

                done();

                var locals = {
                    app: app.name,
                    stack: stack.name,
                    link: config.dashboardHost + '/#!/stack/' + stack._id + '/logs',
                    content: message.data.content,
                    type: type
                };

                if (_data.email) {
                    for (var index in _data.email) {
                        _data.email[index].forEach(function(email) {
                            var notification = new Notification({
                                to: email,
                                stack: message.appId,
                                type: 'logs',
                                tpl: 'error-log',
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
                //     tpl: 'error-log',
                //     subject: 'Error log'
                // } : null;
                obj.pushNotification = {
                    users: _data.pushNotification,
                    alert: 'Error log'
                };

                obj.slack = {
                    users: _data.slack,
                    message: locals.app + '/' + locals.stack + ' has *' + locals.content + '*' + type + ' log. if you like your job you shuold probably go to <' + locals.link + '|here> and fix it.'
                };

                for (var key in _data) {
                    if (notifyService.notify[key] && obj[key]) notifyService.notify[key](obj[key]);
                }
            });
        });
    });
};