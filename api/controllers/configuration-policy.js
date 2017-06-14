'use strict';

var plansService = require('../services/plans'),
    usersCtrl = require('./users'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Stack = mongoose.model('Stack'),
    notifyService = require('../services/notify'),
    config = require(process.cwd() + '/config');

// function to check the the feature Array value
exports.allowA = function(name, user, val, cb) {
    var options = {
        plan: user.plan,
        name: name,
        type: 'A',
        val: val
    };

    plansService.getFeature(options, function(err, data) {
        if (err) return cb(err);
        cb((!data.feature) ? 'Feature: ' + name + ', Type: ' + val + ' is not allowed for ' + data.plan.id + ' plan' : (null));
    });
};

var allowB = exports.allowB = function(name, user, cb) {
    var options = {
        plan: user.plan,
        name: name,
        type: 'B'
    };

    plansService.getFeature(options, function(err, data) {
        if (err) return cb(err);
        cb((!data.feature) ? 'Feature: ' + name + ' is not allowed for ' + data.plan.id + ' plan' : (null));
    });
};

var allowN = exports.allowN = function(name, user, cb) {
    var options = {
        plan: user.plan,
        name: name,
        type: 'N'
    };

    plansService.getFeature(options, function(err, data) {
        if (err) return cb(err);
        cb((!data.feature) ? 'Feature: ' + name + ' is not allowed for ' + data.plan.id + ' plan' : null, data.feature);
    });
};

//TODO: move it to generic function
exports.numStacks = function(req, res, next) {
    var options = {
        plan: req.company.owner.plan,
        name: 'number_of_stacks',
        type: 'S'
    };

    plansService.getFeature(options, function(err, data) {
        if (err) return res.status(500).send(err);
        if (!data.feature) return res.status(500).send('Update plan ' + data.plan.id + ' stacks number val');
        if (data.feature === 'unlimited') return next();
        data.feature = parseInt(data.feature);

        if (req.company.stacks.length >= data.feature) return sendResponse('Too many stacks', res);
        next();
    });
};

exports.teamSupport = function(req, res, next) {

    var action = req.route.path.indexOf('inviteCollaborators') > -1 ? 'invite' : 'confirm';

    allowN('team_support', req.company.owner, function(err, value) {
        if (err) return res.status(500).send(err);
        
        req.confirmedCnt = 0;
        req.company.collaborators.forEach(function(collaborator) {
            if (collaborator.email === req.user.email) req._currentCollaborator = collaborator;
            if (collaborator.id &&
                collaborator.status === 'accepted') req.confirmedCnt++;
        });

        if (!teamActions[action]) return res.send(400);
        teamActions[action](req, res, next, value);
    });
};

var teamActions = {
    invite: function(req, res, next, value) {
        next();
        if (req.confirmedCnt + 1 > value)
            notifyService.notify.email({
                tpl: 'quota-alert-sent-invitations',
                to: req.company.owner.email,
                subject: 'Stacksight team members quota alert',
                locals: {
                    user_name: req.company.owner.name,
                    link_people: config.dashboardHost + '/#!/company/' + req.company._id + '/people',
                    link_upgrade: config.dashboardHost + '/#!/profile/upgrade'
                }
            });
    },
    confirm: function(req, res, next, value) {
        if (!req._currentCollaborator) return res.status(401).send('You are not a collaborator of ' + req.company.name + ' company');
        if ((req.confirmedCnt + 1) <= value) return next();

        sendResponse('Too many collaborators', res);

        notifyService.notify.email({
            tpl: 'quota-alert-responded-invitations',
            to: req.company.owner.email,
            subject: (req._currentCollaborator.name || req._currentCollaborator.email) + ' tries to join your Stacksight team - your help is required',
            locals: {
                user_name: req.company.owner.name,
                invitee_name: req._currentCollaborator.name || req._currentCollaborator.email,
                link_people: config.dashboardHost + '/#!/company/' + req.company._id + '/people?redirect=login',
                link_upgrade: config.dashboardHost + '/#!/profile/upgrade'
            }
        });
    }
};

var sendResponse = exports.sendResponse = function(message, res) {
    res.status(401).send({
        message: message,
        type: 'upgrade plan'
    });
};
