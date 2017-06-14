'use strict';
var mongoose = require('mongoose'),
    users = require('./server/controllers/users'),
    mean = require('meanio'),
    config = mean.loadConfig(),
    _ = require('lodash');

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {

    if (req.headers.authorization) {
        users.findByToken(req.headers.authorization, function(user) {
            if (!user) return res.status(401).send('User is not authorized');
            req.user = user;
            next();
        });

    } else {
        if (!req.isAuthenticated()) {
            return res.status(401).send('User is not authorized');
        }
        next();
    }


};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
    if (!req.isAuthenticated() || req.user.roles.indexOf('admin') === -1) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/**
 * Generic validates if the first parameter is a mongo ObjectId
 */
exports.isMongoId = function(req, res, next) {
    if ((_.size(req.params) === 1) && (!mongoose.Types.ObjectId.isValid(_.values(req.params)[0]))) {
        return res.status(500).send('Parameter passed is not a valid Mongo ObjectId');
    }
    next();
};

exports.requiresToken = function(req, res, next) {
    if (!req.user.profile.token) {
        return res.status(401).send('User is not authorized, token is required');
    }
    req.token = req.user.profile.token;
    if (req.query.tokenName) req.token = config.tokens[req.query.tokenName];
    next();
};
