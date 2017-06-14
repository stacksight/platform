'use strict';

var _ = require('lodash');

var Acl = function() {
    this.acl = {};
};

Acl.prototype.allow = function(permissions, resource, methods) {

    var that = this;
    permissions = _.isArray(permissions) ? permissions : [permissions];
    methods = _.isArray(methods) ? methods : [methods];

    for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        that.acl[method + '-' + resource] = permissions;
    }
};


Acl.prototype.isAllowed = function(req, cb) {

    var skipCompanyAuth = req.skipCompanyAuth,
        uid = req.user._id.toString(),
        company = req.company,
        collaborators = company.collaborators,
        companyOwnerId = company.owner._id.toString(),
        path = req.rewrittenPath || req.route.path,
        method = req.method.toLowerCase(),
        actionPermissions,
        found;


    if (skipCompanyAuth) return cb(null, true); // for actions that stack collaborators can do

    if (companyOwnerId === uid) return cb(null, true);

    actionPermissions = this.acl[method + '-' + path];

    collaborators.forEach(function(collaborator) {
        if (collaborator.id && collaborator.id.toString() === uid && actionPermissions.indexOf(collaborator.permissions[0]) > -1) found = collaborator;
    });

    if (!found) return cb(null, false);
    req.currentCollaborator = found;
    cb(null, true);

};


module.exports = function() {

    var acl = new Acl();

    acl.allow(['owner', 'admin', 'member'], '/tags/:stackId/:companyId?', ['get', 'post']);
    acl.allow(['owner', 'admin', 'member'], '/tags/:companyId', ['get']);
    acl.allow(['owner', 'admin', 'member'], '/tags/:stackId', ['post']);
    acl.allow(['owner', 'admin', 'member'], '/stacks', ['post']);
    acl.allow(['owner', 'admin', 'member', 'guest'], '/stacks/:stackId', ['get']);
    acl.allow(['owner', 'admin'], '/stacks/:stackId', ['put']);
    acl.allow(['owner', 'admin'], '/stacks/:stackId', ['delete']); // Possible to put in a single line ['put', 'delete']
    acl.allow(['owner', 'admin', 'member'], '/stacks/create/:companyId/:source', ['post']);
    acl.allow(['owner', 'admin', 'member', 'guest'], '/stacks/user/:userId/company/:companyId', ['get']);
    acl.allow(['owner', 'admin', 'member'], '/companies/:companyId/inviteCollaborators', ['post']);
    acl.allow(['owner', 'admin'], '/companies/:companyId/removeCollaborators/company', ['post']);
    acl.allow(['owner', 'admin', 'member', 'guest'], '/companies/:companyId/removeCollaborators/stack', ['post']);
    acl.allow(['owner', 'admin'], '/companies/:companyId/updateRole', ['post']);
    acl.allow(['owner', 'admin', 'member'], '/companies/:companyId', ['get']);



    acl.hasPermissions = function(req, res, next) {

        if (!req.company) return res.status(400).send('company is missing');

        acl.isAllowed(req, function(err, allowed) {
            if (allowed) next();
            else return res.status(401).send('User not authenticated');
        });
    };

    acl.rewritePath = function(req, res, next) {
        if (req.route.path === '/companies/:companyId/removeCollaborators' && req.body.from === 'company')
            req.rewrittenPath = '/companies/:companyId/removeCollaborators/company';
        else if (req.route.path === '/companies/:companyId/removeCollaborators')
            req.rewrittenPath = '/companies/:companyId/removeCollaborators/stack';
        next();
    };

    return acl;
};