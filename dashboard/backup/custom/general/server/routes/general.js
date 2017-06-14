'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter

var config = require('meanio').loadConfig(),
    urlPattern = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;


module.exports = function(General, app, auth, database) {

    var sapi = require('../../../sapi/server/controllers/sapi');

    var getOptions = {};
    getOptions.stack = function(req, res) {
        return {
            cmd_api: '/stacks/' + req.params.id,
            method: 'PUT',
            token: req.user.token,
            redirect: '/#!/stacks',
            form: {
                action: 'updateArray',
                updateAction: 'confirmInvitation',
                object: req.user,
                array: 'collaborators',
                key: 'email'
            }
        };
    };
    getOptions.registerStack = function(req, data) {
        return {
            cmd_api: '/registerStack',
            method: 'POST',
            token: req.user.token,
            form: data
        };
    };

    app.get('/confirm/:object/:id', function(req, res) {
        if (!req.isAuthenticated()) {
            var redirect = req.query.redirect ? req.query.redirect : 'login';
            req.session.redirectTo = req.originalUrl;
            return res.redirect('/#!/auth/' + redirect);
        }
        var options = getOptions[req.params.object](req, res);
        sapi.talkToApi(options, function(err, data) {
            if (err) return res.send(err);
            if (req.params.object !== 'stack') return res.redirect(options.redirect);
            res.redirect('/#!/stack/' + data._id);
        });
    });

    //redirect url comes from sapi without hash bang
    app.get('/redirect', function(req, res) {
        if (!req.isAuthenticated()) {
            var authRedirect = req.query.authRedirect ? req.query.authRedirect : 'login';
            req.session.redirectTo = '/#!' + req.query.url;
            return res.redirect('/#!/auth/' + authRedirect);
        }
        res.redirect('/#!/' + req.query.url);
    });

    app.get('/auth/slack', function(req, res) {
        if (!req.isAuthenticated()) {
            var redirect = 'register';
            req.session.redirectTo = req.originalUrl;
            return res.redirect('/#!/auth/' + redirect);
        }
        res.redirect('https://slack.com/oauth/authorize?scope=incoming-webhook,commands,channels:write,channels:read,chat:write:bot&client_id=' + config.slack.client_id);
    });

    app.get('/registerStack', function(req, res) {
        var data = {};
        data.url = req.query.url;
        data.platform = 'web';
        if (!data.url || !urlPattern.test(data.url)) return res.status(400).send('url pattern doesn\'t match');
        data.domain = data.url.replace('http://', '');
        data.domain = data.domain.replace('https://', '');
        data.host = data.url;
        if (!req.isAuthenticated()) {
            req.session.redirectTo = req.originalUrl;
            return res.redirect('/#!/auth/register');
        }
        var options = getOptions['registerStack'](req, data);
        sapi.talkToApi(options, function(err, data) {
            if (err) return res.send(err);
            res.redirect('/#!/stacks/' + data.appId + '/health/performance');
        });
    });
};
