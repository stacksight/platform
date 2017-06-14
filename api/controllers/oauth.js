'use strict';

require('../models/user');

var config = require(process.cwd() + '/config'),
    mongoose = require('mongoose'),
    usersCtrl = require('./users'),
    _ = require('lodash'),
    request = require('request'),
    Slack = require('slack-api');

exports.code = function(req, res, next) {

    var code = req.body.code;
    var state = req.body.state;

    if (!code) return res.send(500, {
        ok: false,
        error: 'There is no code'
    });

    Slack.oauth.access({
        client_id: config.slack.client_id,
        client_secret: config.slack.client_secret,
        code: code,
        redirect_uri: config.slack.redirect_url
    }, function(error, response) {
        if (!response.ok) return res.send(response);
        var slack_obj = {
            access_token: response.access_token,
            incoming_webhook: response.incoming_webhook,
            scope: response.scope,
            team_id: response.team_id,
            team_name: response.team_name
        };

        Slack.auth.test({
            token: response.access_token
        }, function(error, response) {
            if (!response.ok) return res.send(response);
            slack_obj.slack_user = {
                url: response.url,
                team: response.team,
                user: response.user,
                team_id: response.team_id,
                user_id: response.user_id
            }
            var set = { oauth_slack: slack_obj };
            usersCtrl.updateS(req.user._id, set, function(err, user) {
                if (err) return res.send(500, {
                    ok: false,
                    error: err
                });
                res.send({
                    ok: true,
                    upsession: {
                        key: 'user',
                        value: user
                    }
                });
            });
        });
    });
};
