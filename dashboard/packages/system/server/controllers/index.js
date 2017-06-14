'use strict';

var mean = require('meanio'),
    config = mean.loadConfig();

exports.render = function(req, res) {

    var modules = [];
    // Preparing angular modules list with dependencies
    for (var name in mean.modules) {
        modules.push({
            name: name,
            module: 'mean.' + name,
            angularDependencies: mean.modules[name].angularDependencies
        });
    }

    //function isAdmin() {
    //  return req.user && req.user.roles.indexOf('admin') !== -1;
    //}

    // Send some basic starting info to the view
    res.render('index', {
        user: req.user ? {
            name: req.user.name,
            _id: req.user._id,
            username: req.user.username,
            phone: req.user.phone,
            roles: req.user.roles,
            profile: req.user.profile,
            created: req.user.created,
            stripe: req.user.stripe,
            email: req.user.email,
            location: req.user.location,
            notifyBy: req.user.notifyBy,
            oauth_slack: req.user.oauth_slack,
            oauth_platform: req.user.oauth_platform,
            plan: req.user.plan,
            companies: req.user.companies
        } : {},
        modules: modules,
        host: config.host
        //menus: req.menus
        //isAdmin: isAdmin,
        //adminEnabled: isAdmin() && mean.moduleEnabled('mean-admin')
    });
};