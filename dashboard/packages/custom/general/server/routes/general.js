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
            cmd_api: '/stacks/' + req.params.id + '/confirmInvitation',
            method: 'GET',
            token: req.user.token,
            redirect: '/#!/stack/' + req.params.id
        };
    };
    getOptions.company = function(req, res) {
        return {
            cmd_api: '/companies/' + req.params.id + '/confirmInvitation',
            method: 'GET',
            token: req.user.token,
            redirect: '/#!/company/' + req.params.id + '/dashboard'
        };
    };
    getOptions.registerStack = function(req, data) {
        return {
            cmd_api: '/stacks/register',
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

            if (!data.upsession) return res.redirect(options.redirect);

            sapi.saveSession(req, data.upsession.key, data.upsession.value, function(err) {
                if (err) return res.status(500).json({
                    error: 'Session update failed, please login again..'
                });
                res.redirect(options.redirect);
            });
        });
    });
    //redirect url comes from sapi without hash bang
    app.get('/redirect', function(req, res) {
        if (!req.isAuthenticated()) {
            var authRedirect = req.query.authRedirect ? req.query.authRedirect : 'register';
            req.session.redirectTo = '/#!' + req.query.url;
            return res.redirect('/#!/auth/' + authRedirect);
        }
        res.redirect('/#!' + req.query.url);
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
        var site = {};
        site.url = req.query.url;
        if (!site.url) return res.status(400).send('url pattern doesn\'t match');
        site.platform = 'web';
        site.url = site.url.toLowerCase();
        if (!site.url || !urlPattern.test(site.url)) return res.status(400).send('url pattern doesn\'t match');
        site.domain = site.url.replace('http://', '');
        site.domain = site.domain.replace('https://', '');
        site.host = site.url;
        site.id = 0;
        if (!req.isAuthenticated()) {
            req.session.redirectTo = req.originalUrl;
            return res.redirect('/#!/auth/register');
        }
        var options = getOptions['registerStack'](req, {sites: [site]});
        sapi.talkToApi(options, function(err, data) {
            if (err) return res.send(err);
            res.redirect('/#!/stack/' + data[0] + '/health/performance');
        });
    });
};