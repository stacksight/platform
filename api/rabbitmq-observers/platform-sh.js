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
    var type = (message.data.data.result === 'success') ? 'build' : 'error';

    cp.allowA('platformNotifications', message.user, type, function(err) {

        if (err) {
            error(err);
            return console.error('PLATFORM OBSERVER ERR', err);
        }

        var type = (message.data.data.result === 'success') ? 'build' : 'error';

        stacks._stack(message.data.appId, function(err, stack, app) {

            if (err) {
                error(err);
                return console.error('PLATFORM OBSERVER ERR', err);
            }

            users.getCollaborators(stack, ['main:integrations', 'integrations-platform'], function(err, _data) {
                if (err) {
                    error();
                    return console.error('PLATFORM OBSERVER ERR', err);
                }

                done();

                var locals = {
                    app: app.name,
                    stack: stack.name,
                    link: config.dashboardHost + '/#!/stack/' + stack._id + '/builds/platform',
                    content: (type === 'build') ? 'build success ' : 'build failed ',
                    build: (type === 'build') ? message.data.data.log : ''
                };

                if (_data.email) {
                    for (var index in _data.email) {
                        _data.email[index].forEach(function(email) {
                            var notification = new Notification({
                                to: email,
                                stack: message.appId,
                                type: 'platformsh',
                                tpl: 'platformsh',
                                locals: locals,
                                frequency: index
                            });
                            notification.save();
                        });
                    }
                }

                var obj = {};
                obj.email = (_data.email && _data.email.immediate) ? {
                    to: _data.email.immediate,
                    locals: locals,
                    tpl: 'platformsh',
                    subject: 'Stacksight - platform.sh integrations'
                } : null;
                obj.pushNotification = {
                    users: _data.pushNotification,
                    alert: 'Platform'
                };

                obj.slack = {
                    users: _data.slack,
                    message: locals.app + '/' + locals.stack + ((type === 'build') ? ' build success!' : ' build failed :(')
                };

                for (var key in _data) {
                    if (notifyService.notify[key] && obj[key]) notifyService.notify[key](obj[key]);
                }
            });
        });
    });
};

function prepereText(data) {
    o.data = o._source.data;
    o.result = o.data.result;
    o.type = o.data.type.replace('environment.', '');
    o.id = o.data.id;
    o.comment = o.data.log;
    o.title = o.data.payload.user.display_name /* + ' ' + o.data.type + ' ' + o.data.environments[0]*/ ;
    o.environment = (o.data.payload.environment) ? o.data.payload.environment.name : '';
    o.title = o.title + ' ' +
        ((o.type === 'branch') ? 'branched environment ' + o.data.environments[0] + ' from ' + o.data.environments[1] :
            (o.type === 'push') ? 'pushed to ' + o.environment :
            (o.type === 'variable.create') ? 'added variable ' + o.data.payload.variable.id :
            (o.type === 'deactivate') ? 'deactivated environment ' + o.environment :
            (o.type === 'activate') ? 'activated environment ' + o.environment :
            (o.type === 'backup') ? 'created a snapshot of ' + o.environment :
            (o.type === 'update.http_access') ? 'updated HTTP Access settings on environment ' + o.environment :
            (o.type === 'synchronize') ? 'synced ' + o.data.parameters.into + '\'s' + ((o.data.parameters.synchronize_data) ? ' data ' : '') + ((o.data.parameters.synchronize_data && o.data.parameters.synchronize_code) ? '&' : '') + ((o.data.parameters.synchronize_code) ? ' code' : '') : '');
    o.created = o.data.created_at;
}