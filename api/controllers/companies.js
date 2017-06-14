'use strict';

require('../models/company');

var mongoose = require('mongoose'),
    Company = mongoose.model('Company'),
    mails = require('../providers/mails'),
    users = require('./users'),
    config = require(process.cwd() + '/config'),
    stacksight = require('../providers/stacksight'),
    stacksCtrl = require('./stacks'),
    _ = require('lodash'),
    async = require('async'),
    activities = require('./activities');

exports.create = function(req, res, next) {

    var company = new Company({
        name: req.user.email,
        owner: req.user,
        collaborators: [{
            id: req.user,
            status: 'accepted',
            email: req.user.email,
            permissions: ['owner']
        }]
    });

    company.save(function(err) {
        if (err) return res.status(500).send('Something bad happened.... Try again please.');
        req.user.companies.push({
            id: company._id,
            permission: 'owner',
            name: company.name
        });
        req.user.save(function(err) {
            if (err) console.error('SAVE COMPANY IN USER SCHEMA ERR', err);
            if (req.newUser) return res.send(req.user);
            res.send(company);
        });
    });
};

exports.update = function(req, res) {
    var action = req.body.action;
    if (!updateFunctions[action]) return res.send(501);
    updateFunctions[action](req, res);
};


var updateFunctions = {

    updateDetails: function(req, res) {
        var company = req.company;

        var uneditableFields = ['owner', 'collaborators', 'stacks'];

        uneditableFields.forEach(function(field) {
            delete req.body.stack[field];
        });

        company = _.extend(company, req.body.company);

        company.save(function(err) {
            if (err) return res.status(500).send('Something bad happened.... Try again please.');

            res.send(200);
        });
    },
    // updateArray: function(req, res) {
    //     var body = req.body,
    //         object = body.object,
    //         action = body.updateAction,
    //         array = body.array,
    //         key = body.key,
    //         company = req.company;

    //     var objIndex;
    //     company[array].forEach(function(elem, index) {
    //         if (elem[key] === object[key]) objIndex = index;
    //     });

    //     switch (action) {
    //         case 'add':
    //             if (objIndex) break;
    //             company[array].addToSet(object);
    //             break;
    //         case 'remove':
    //             //TODO remove collaborator(update array) needs to be in permissions
    //             if (company[array][objIndex].status === 'owner') return res.send(401);
    //             company[array].pull({
    //                 _id: company[array][objIndex]._id
    //             });
    //             break;
    //         case 'update':
    //             //TODO make it generic !!!
    //             company[array][objIndex].permissions = object.permissions;
    //             break;
    //         case 'disconnect':
    //             company[array][objIndex].status = 'disconnected';
    //             company[array][objIndex].id = null; //for companys.find()
    //             break;
    //         case 'confirmInvitation':
    //             company.collaborators.forEach(function(collaborator) {
    //                 if (object.email === collaborator.email.toLowerCase()) {
    //                     collaborator.status = 'accepted';
    //                     collaborator.acceptedDate = Date.now();
    //                     collaborator.id = object._id;
    //                 }
    //             });
    //             //ORIT TODO : add company to user companies

    //             break;
    //     }
    //     company.save(function(err, doc) {
    //         console[(err) ? 'error' : 'log'](err);
    //         if (err) return res.send(500, 'Something bad happened.... Try again please.');

    //         if (action === 'add' && array === 'collaborators') return inviteCollaborator(req, res);

    //         res.send(doc);
    //     });
    // }
};

var addCollaorators = exports.addCollaborators = function(src, company, users, isAdmin, cb) {
    var collaborators = [];
    users.forEach(function(user) {
        var exist = _.find(company.collaborators, function(o) {
            return o.email === user.email;
        })
        if (exist) return cb(null);
        collaborators.push({
            name: user.name,
            email: user.email.toLowerCase(),
            permissions: (isAdmin) ? ['admin'] : ((src === 'company') ? ['member'] : ['guest']),
        });
    });
    Company.update({
        _id: company._id
    }, {
        $push: {
            collaborators: {
                $each: collaborators
            }
        }
    }).exec(function(err, doc) {
        if (err) return cb(err);
        cb(null);
    });
};

exports.inviteCollaborators = function(req, res, next) {
    // move the args to 1 object
    var data = req.body; // data includes: collaborators(array of emails), stacks(array of ids), isAdmin, to(company/stacks/stack);
    data.collaborators = _.isArray(data.collaborators) ? data.collaborators : [data.collaborators];
    if (data.stacks)
        data.stacks = _.isArray(data.stacks) ? data.stacks : [data.stacks];

    stacksCtrl._addCollaboratorsToStacks(data.to, req.user, req.company, data.collaborators, data.stacks, data.isAdmin, function(err, users, stacks) {
        if (err) return res.status(500).send(err);
        if (data.to === 'company')
            sendInvitationEmail(req.company, req.user, users, stacks);
        else stacksCtrl.sendInvitationEmail(req.company, req.user, users, stacks);
        res.send(users);
    });
};

exports.removeCollaborators = function(req, res, next) {

    var data = req.body; // data includes: collaborators(array of emails), stacks(array of ids), isAdmin, to(company/stacks/stack);
    data.collaborators = _.isArray(data.collaborators) ? data.collaborators : [data.collaborators];
    if (data.stacks)
        data.stacks = _.isArray(data.stacks) ? data.stacks : [data.stacks];

    stacksCtrl._removeCollaboratorsFromStacks(data.from, req.user, req.company, data.collaborators, data.stacks, function(err, users, stacks) {
        if (err) return res.status(500).send(err);
        res.send(200);
    });
};

function sendInvitationEmail(company, host, users, stacks) {
    users.forEach(function(user) {
        var link;
        if (user._id) {
            link = config.dashboardHost + '/confirm/company/' + company._id + '?redirect=login';
            return sendEmail('invite', host, user, link, company);
        }
        link = config.dashboardHost + '/confirm/company/' + company._id + '?redirect=register';
        sendEmail('register', host, user, link, company);
    });
}

var _confirmInvitation = exports._confirmInvitation = function(req, cb) {
    async.waterfall([
        async.apply(updateCompanyDueConfirmation, req),
        updateStacksDueConfirmation,
        updateUserDueConfirmation
    ], function(err, result) {
        if (err) return cb(err);
        cb(null, {
            upsession: {
                key: 'user',
                value: result
            },
            user: result
        })
    });
};

exports.confirmInvitation = function(req, res) {
    _confirmInvitation(req, function(err, data) {
        if (err) return res.status(500).send(err);
        res.send(data);
    });
};

function updateCompanyDueConfirmation(req, callback) {
    var user = req.user;
    Company.update({
        'collaborators.email': user.email,
        _id: req.company._id
    }, {
        '$set': {
            'collaborators.$.id': user._id,
            'collaborators.$.status': 'accepted',
            'collaborators.$.acceptedDate': Date.now()
        }
    }, {
        multi: true
    }, function(err, numAffected) {
        return callback(err, req);
    });

}

function updateStacksDueConfirmation(req, callback) {
    var src = (req.params.companyId) ? 'company' : 'stack',
        stack = (src === 'company') ? null : req.stack;
    stacksCtrl.updateDueConfirmation(src, req.user, req.company, stack, function(err, data) {
        return callback(err, req);
    });
}

function updateUserDueConfirmation(req, callback) {
    var permission;
    req.company.collaborators.forEach(function(collaborator) {
        if (req.user.email === collaborator.email.toLowerCase()) {
            permission = collaborator.permissions[0];
            return;
        }
    });
    if (!permission) return callback('Collaborator ' + req.user.email + ' doesn\'t  exist in ' + req.company.name + ' company');
    req.user.companies.addToSet({
        id: req.company._id,
        permission: permission,
        name: req.company.name
    });
    req.user.save(function(err, doc) {
        return callback(err, doc);
    });
}

function sendEmail(tpl, host, guest, link, company) {
    mails.send(tpl, {
        to: guest.email,
        subject: host.name + ' has invited you to see insights for ' + company.name + ' company.',
        locals: {
            host: host.name,
            guest: (guest.name || guest.email),
            link: link,
            app: company.name
        }
    }, function(err) {
        if (err) return console.error(err);
        console.log('INVITATION MAIL SENT SUCCESSFULLY');
        activities.register('company', company, host, 'add', host.name + ' added collaborator ' + guest.email + ' to ' + company.name + ' company');
    });
}

exports.delete = function(req, res) {

};

exports.find = function(req, res, next) {

};

exports.findOne = function(req, res, next) {

    var populate = (req.query.populate) ? req.query.populate.split(',') : [];
    var populateOpts = {
            stacks: {
                path: 'stacks',
                model: 'Stack',
                select: 'name platform tags'
            },
            collaborators: {
                path: 'collaborators.id',
                model: 'User',
                select: 'name profile.pictures.profile'
            }
        },
        options = [];

    for (var i = 0; i < populate.length; i++) {
        var elem = populate[i];
        if (populateOpts[elem])
            options.push(populateOpts[elem]);
    }

    Company.populate(req.company, options, function(err, doc) {
        if (err || !doc) return res.send(500);
        res.json(doc);
    });
};

exports.company = function(req, res, next) {

    var companyId = req.body.company || req.params.companyId || req.stack.company;

    findOne({
        _id: companyId
    }, function(err, data) {
        if (err) return res.status(err).send(data);
        req.company = data;
        next();
    });
};

exports.isOwner = function(req, res, next) {
    if (req.company && req.company.owner._id.toString() === req.user._id.toString()) return next();
    res.send(401);
};


exports.updateRole = function(req, res) {
    //when remove admin, set as member
    var data = req.body,
        collaborators = data.collaborators,
        _collaborators = req.company.collaborators,
        collaboratorsIds = [],
        permissions = (data.action === 'add' && data.role === 'admin') ? ['admin'] :
        ((data.action === 'remove' && data.role === 'admin') ? ['member'] : null),
        set = {};

    if (!permissions) return res.send(400);

    for (var i = 0; i < _collaborators.length; i++) {
        if (collaborators.indexOf(_collaborators[i].email) > -1) {
            // removing admin role is not upgrading guest to be member;
            if (permissions[0] === 'member' && _collaborators[i].permissions.indexOf('guest') > -1) continue;
            set['collaborators.' + i + '.permissions'] = permissions;
            if (_collaborators[i].id) collaboratorsIds.push(_collaborators[i].id);
        }  
    }

    Company.update({
        _id: req.company._id
    }, {
        '$set': set
    }, {
        multi: false
    }, function(err, numAffected) {
        if (err) return res.status(500).send(err);
        users.updateCompanyRole(req.company._id, collaboratorsIds, permissions, function(err) {
            if (err) return res.status(500).send(err);
            res.send(200);
        });
    });
};

var _removeCollaborators = exports._removeCollaborators = function(company, users, cb) {

    var collaborators = _.map(users, 'email');
    Company.update({
        _id: company._id
    }, {
        $pull: {
            collaborators: {
                email: {
                    $in: collaborators
                }
            }
        }
    }).exec(function(err, doc) {
        cb(err, doc);
    });
};

exports.findByUser = function(req, res, next) {

    findOne({
        owner: req.user
    }, function(err, data) {
        if (err) return res.status(err).send(data);
        req.company = data;
        next();
    });
};

function findOne(query, cb) {

    Company.findOne(query).populate('owner', 'roles token plan email').exec(function(err, company) {
        if (err) return cb(500, err);
        if (!company) return cb(400, 'Company is not found');
        cb(null, company);
    });
};

exports.changeName = function(req, res, next) {
    if (!req.body.companyName) return res.status(400).send('Company name is required');

    req.company.name = req.body.companyName;
    req.company.save(function(err, doc) {
        if (err) return res.status(500).send(err);
        users.updateCompanyName(doc, function(err) {
            if (err) return res.status(500).send(err);
            next();
        });
    });
};

exports.removeCollaboratorByGuest = function(req, res, next) {
    if (!req.currentCollaborator || (req.currentCollaborator.permissions[0] !== 'guest')) return next();

    var data = req.body;
    data.collaborators = _.isArray(data.collaborators) ? data.collaborators : [data.collaborators];

    if (data.collaborators.length > 1) return res.send(401);
    if (data.collaborators[0] !== req.user.email) return res.send(401);
    next();
}

exports.stackDeleted = function(data, cb) {
    var query = {};
    var stackId = data.stackId;

    query.stacks = {
        $in: [stackId]
    };
    Company.update(query, {
            $pull: {
                stacks: stackId
            }
        }, {
            multi: true
        },
        function(err, res) {
            if (err) return cb(err);
            cb(null, res);
        });
};