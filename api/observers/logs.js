'use strict';

var config = require(process.cwd() + '/config'),
    notifyService = require('../services/notify'),
    stacks = require('../controllers/stacks'),
    users = require('../controllers/users'),
    cp = require('../controllers/configuration-policy');

var q = require('../providers/busmq').get('logs-observer-sts');
q.consume();

q.on('message', function(message) {
    message = JSON.parse(message);

    if (!message.data.method) return;

    cp.logsNotifications(message.user, function(err, types) {

        var type = message.data.method.toLowerCase();

        if (types.indexOf(type) === -1) return;

        stacks._stack(message.data.appId, function(err, stack) {

            if (err) return console.log('LOGS OBSERVER ERR', err);

            users.getCollaborators(stack, ['main:logs', 'logs-' + type], function(err, _data) {
                if (err) return console.error('LOGS OBSERVER ERR', err);

                var locals = {
                    app: stack.app.name,
                    stack: stack.name,
                    link: config.dashboardHost + '/#!/stacks/' + stack._id + '/logs',
                    content: message.data.content,
                    type: type
                };

                var obj = {};
                obj.email = {
                    to: _data.email,
                    locals: locals,
                    tpl: 'error-log',
                    subject: 'Error log'
                };
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
});
