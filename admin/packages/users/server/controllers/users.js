/*jshint nonew: false */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    async = require('async'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    request = require('request'),
    sapi = require('../../../custom/sapi/server/controllers/sapi'),
    templates = require('../template');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.redirect('#!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {

    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('name', 'You must enter a name').notEmpty();
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    var options = {
        uri: config.stsApi.uri + '/user',
        form: req.body
    };
    request.post(options, function(error, response, body) {
        if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.log(e);
                return res.send(500);
            }

            req.logIn(body, function(err, data) {
                if (err) return res.status(500).send(err);
                var redirectTo = req.session.redirectTo ? req.session.redirectTo : null;
                delete req.session.redirectTo;
                res.send({
                    user: req.user,
                    redirect: redirectTo ? redirectTo : false
                });
                // res.status(200).send(body);
            });
        } else {
            res.status(400).send(body);
        }
    });
};
/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};

/**
 * Resets the password
 */

exports.resetpassword = function(req, res, next) {

    var options = {
        cmd_api: '/reset/' + req.params.token,
        method: 'POST',
        form: req.body
    };
    sapi.talkToApi(options, function(err, data) {
        if (err) return res.send(500, 'Something bad happened, try again please.');
        req.logIn(data.user, function(err) {
            if (err) return res.status(500).json({
                msg: 'Something bad happened, try again please!'
            });
            res.send({
                user: data.user
            });
        });
        //res.send(data);
    });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function(req, res, next) {

    var options = {
        cmd_api: '/forgot-password',
        method: 'POST',
        form: req.body
    };
    sapi.talkToApi(options, function(err, data) {
        if (err) return res.send(500, 'Something bad happened, try again please.');
        res.send(data);
    });
};

exports.findByToken = function(token, cb) {
    var options = {
        cmd_api: '/user',
        token: token,
        method: 'GET'
    };
    sapi.talkToApi(options, function(err, data) {
        if (err) return cb(null);
        cb(data);
    });
};
