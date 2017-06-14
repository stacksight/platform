'use strict';

var q = require('../providers/busmq').get('updates-observer-sts');
q.consume();

var stacks = require('../controllers/stacks'),
    users = require('../controllers/users'),
    _ = require('lodash'),
    statusTypes = {
        critical: [1],
        available: [2, 3, 4, 5]
    },
    config = require(process.cwd() + '/config'),
    notifyService = require('../services/notify');

//TODO : MOVE IT TO BE GENERIC FOR ALL OBSERVERS, NOT ONLY UPDATES

q.on('message', function(message) {

    message = JSON.parse(message);

    stacks._stack(message.data.appId, function(err, stack, app) {

        if (err) return console.error('UPDATES OBSERVER ERR1', err);

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

        stacks._update(stack, function(err, doc) {
            if (err) return console.error('UPDATES OBSERVER ERR2', err);
            console.log('UPDATE OBSERVER SUCCESS');
        });

        if (data.data.critical === 0 || !stack.app) return;

        users.getCollaborators(stack, 'updates', function(err, _data) {
            if (err) return console.error('UPDATES OBSERVER ERR3', err);

            var locals = {
                critical: data.data.critical,
                available: data.data.available,
                updated: data.updated,
                app: app.name,
                stack: stack.name,
                link: config.dashboardHost + '/#!/stacks/' + stack._id + '/updates'
            };

            var obj = {};
            obj.email = {
                to: _data.email,
                locals: locals,
                tpl: 'updates',
                subject: 'Critical updates'
            };
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
        });
    });
});
