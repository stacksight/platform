var config = require(process.cwd() + '/config');
var mongoose = require('mongoose');
var elastic = require('./elastic');
require('../models/user');
var User = mongoose.model('User');
var crypt = require('./crypto');
var stacks = require('./stacks');
var crypto = require('crypto');
var appsunIndexes = config.appsunIndexes;
var nodemailer = require('nodemailer');
var _ = require('lodash');
var gravatar = require('gravatar');
var async = require('async');
var mails = require('../providers/mails');
var Elastic = require('../providers/elastic')();
var utils = require('../services/utils');
var stsEvents = require('../services/events');
var stacksight = require('../providers/stacksight');
var Global = require('../services/global');



function validateUser(req) {
    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('name', 'You must enter a name').notEmpty();
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('username', 'Username cannot be more than 20 characters').len(1, 50);
    if (!req.params.provider || req.params.provider === 'local') {
        req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
        req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    }
    return req.validationErrors();

}

function userErrCodes(err, res) {
    switch (err.code) {
        case 11000:
        case 11001:
            res.status(400).json([{
                msg: 'Username already taken',
                param: 'username'
            }]);
            break;
        default:
            var modelErrors = [];

            if (err.errors) {

                for (var x in err.errors) {
                    modelErrors.push({
                        param: x,
                        msg: err.errors[x].message,
                        value: err.errors[x].value
                    });
                }

                res.status(400).json(modelErrors);
            }
    }
}


exports.create = function(req, res, next) {

    var uneditableFields = ['roles', 'plan', 'subscription'];

    uneditableFields.forEach(function(field) {
        delete req.body[field];
    });

    req.body.username = req.body.email;

    var user = new User(req.body);
    user.provider = req.params.provider || 'local';

    var errors = validateUser(req);

    if (errors) return res.status(400).send(errors);

    user.profile = {
        pictures: {
            collectionId: null,
            apps: [],
            profile: gravatarImg(user.email)
        },
        preferences: {
            apps: {}
        },
        billing: {},
        notifications: {}
    };

    user.save(function(err) {
        if (err) {
            userErrCodes(err, res);
            return res.status(400);
        }
        req.user = user;
        next();
    });
};

exports.slackauthorize = function(req, res, next) {
    if (req.body.user_id) {
        User.findOne({
            'oauth_slack.slack_user.user_id': req.body.user_id
        }, function(err, user) {
            if (err || !user) return res.send(401);
            req.user = user;
            next();
        });
    } else {
        return res.send(401);
    }
};

exports.authorize = function(req, res, next) {

    User.findOne({
        'token': req.headers.authorization //,
            // 'token.expires': {
            //     $gt: new Date()
            // }
    }, function(err, user) {

        if (err || !user) return res.send(401);

        // var decoded = crypt.decrypt(req.headers.authorization, user.salt);

        // if (decoded !== user.token.gitlab) return res.send(401);

        req.user = user;

        next();
    });

};

exports.login = function(req, res, next) {

    var body = {
        email: req.body.email,
        password: req.body.password
    };

    User.findOne({
        email: body.email.toLowerCase()
    }).exec(function(err, user) {
        if (err) return res.send(500, err);
        if (!user) return res.send(401, {
            message: 'Unknown user'
        });
        if (!user.authenticate(body.password)) {
            return res.send(401, {
                message: 'Invalid password'
            });
        }
        stacksight.event({
            action: 'logged_in',
            type: 'user',
            name: user.name,
            icon: 'fa-user',
            icon_col: '#8C66B1'
        });

        user.lastLogin = Date.now();
        user.save();

        return res.send(200, user);
    });
};

exports.get = function(req, res, next) {

    User.findOne({
        id: req.user.id
    }, {
        name: 1,
        username: 1,
        _id: 0,
        created: 1,
        'token': 1
    }, function(err, user) {
        if (err) return res.send(500);

        if (user) {
            return res.json(user);
        }
        res.send(401);
    });
};

exports.createToken = function(req, res, next) {

    var user = req.user;

    var created = new Date();
    var salt = crypt.hash(JSON.stringify({
        id: user._id,
        created: created
    }));

    user.token = 'ss-' + crypt.encrypt(user._id.toString(), salt);
    user.set('profile.token', false);
    user.profile.token = user.token;
    // user.privateToken = user.token.

    user.save(function(err, doc) {
        if (err) return res.send(500, err);

        stsEvents.emit('index', 'users', doc);

        mails.send('welcome', {
            to: user.email,
            subject: 'Welcome',
            locals: {
                name: user.name,
                link: config.dashboardHost + '/redirect?url=apps&authRedirect=login'
            }
        });

        req.user = user;
        req.newUser = true;
        next();

    });
};

exports.emailAndIndex = function(message, cb) {

    var query = {};
    var token = message.data.token,
        mngToken = message.data.mngToken;

    if (!token && !mngToken) return cb('no user token');

    if (token) query['token'] = token;
    else query['_id'] = mngToken;

    User.findOne(query, function(err, user) {
        console.log('======== GET USER EMAIL AND INDEX NAME ===========');
        if (err || !user) return cb(err ? err : 'user doesn\'t exist');
        else {
            message.data.email = user.email;
            message.data.token = user.token;
            console.log(user.email);
            indexName(user);
        }
        console.log('======== END OF GET USER EMAIL AND INDEX NAME ========');
    });

    function indexName(user) {
        //NO user === MEAN user;
        if (appsunIndexes.indexOf(message.originalIndex) === -1)
            return cb(null, user);

        if (user && user.roles && user.roles.length && user.roles.indexOf('subscriber') > -1) { // only for now
            message.index = 'user-' + message.data.token + '-' + message.originalIndex;
            if (Global.rollIndex === '') return cb(null, user);
        }
        message.data.created = message.data.created || new Date();
        message.index = utils.indexNameByDate(message.index, message.data.created);

        return cb(null, user);
    }
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


//function to update user from the client (user can edit himself)
exports.update = function(req, res) {

    var user = req.user;

    var uneditableFields = ['email', 'token', 'roles', 'plan', 'subscription', 'companies', 'hashed_password', 'salt'];
    //romve it to object with root: ['email', 'token', 'roles', 'plans', 'activePlan'] and profile: ['token']

    uneditableFields.forEach(function(field) {
        delete req.body[field];
    });

    if (req.body.profile) {
        delete req.body.profile.token;
        delete req.body.profile.billing;
    }

    if (req.body.lastVisit) req.body.lastVisit = Date.now();

    var user = req.user.toJSON(),
        uid = user._id;

    user = _.merge(user, req.body);

    if (req.body.profile && req.body.profile.notifications) //_.merge is not ok for arrays , check how to do it with all
        user.profile.notifications = req.body.profile.notifications;

    delete user._id;

    User.findOneAndUpdate({
        _id: uid
    }, {
        $set: user
    }, {
        new: true
    }, function(err, doc) {
        if (err) return res.send(500);
        res.send({
            upsession: {
                key: 'user',
                value: doc
            },
            user: doc
        });
    });
};

//update user from server code, not form api
exports.updateS = function(id, set, cb) {
    User.findOneAndUpdate({
        _id: id
    }, {
        $set: set
    }, {
        new: true
    }).exec(function(err, _user) {
        if (err) return cb(err);
        cb(null, _user);
    });
};

function gravatarImg(email) {
    var url = gravatar.url(email, {}, true);
    return url;
}

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function(req, res, next) {
    async.waterfall([

            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({
                    $or: [{
                        email: req.body.text.toLowerCase()
                    }, {
                        username: req.body.text
                    }]
                }, function(err, user) {
                    if (err || !user) return done(true);
                    done(err, user, token);
                });
            },
            function(user, token, done) {
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function(err) {
                    done(err, token, user);
                });
            },
            function(token, user, done) {
                mails.send('forgotpassword', {
                    to: user.email,
                    subject: 'Resetting the password',
                    locals: {
                        name: user.name,
                        link: config.dashboardHost + '/#!/auth/reset/' + token
                    }
                });
                done(null, true);
            }
        ],
        function(err, status) {
            var response = {
                message: 'Mail successfully sent',
                status: 'success'
            };
            if (err) {
                response.message = 'User does not exist';
                response.status = 'danger';
            }
            res.json(response);
        }
    );
};

exports.resetpassword = function(req, res, next) {

    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (err) {
            return res.status(400).json({
                msg: err
            });
        }
        if (!user) {
            return res.status(400).json({
                msg: 'Token invalid or expired'
            });
        }
        req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
        req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors);
        }

        delete req.body.confirmPassword;

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save(function(err) {
            if (err) return res.send(500, {
                msg: 'Something bad happened, please try again please.'
            });
            res.send({
                user: user
            });
        });
    });
};


exports.changepassword = function(req, res, next) {
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    delete req.body.confirmPassword;

    req.user.password = req.body.password;
    req.user.resetPasswordToken = undefined;
    req.user.resetPasswordExpires = undefined;
    req.user.save(function(err, doc) {
        if (err) return res.stats(500).send({
            msg: 'Something bad happened, please try again please.'
        });
        res.send({
            upsession: {
                key: 'user',
                value: doc
            },
            user: doc
        });
    });
};

exports.find = function(req, res) {

    var indexes = [];
    var stats = (req.query.stats && req.query.stats === 'false') ? false : true;

    var fields = (stats) ? {
        name: 1,
        email: 1,
        token: 1,
        stripe: 1,
        created: 1
    } : {
        name: 1,
        email: 1
    };

    User.find({}, fields).exec(function(err, users) {
        if (err) return res.status(500, err);
        if (!stats) return res.send(users);
        var cnt = 0;
        users.forEach(function(user) {
            Elastic.indices.exists({
                index: 'user-' + user.token + Global.rollIndex
            }, function(error, exists) {
                cnt++;
                if (!error && exists) indexes.push('user-' + user.token + Global.rollIndex);
                if (cnt === users.length) getStats(users);
            });
        });
    });

    function getStats(users) {
        Elastic.indices.stats({
            index: indexes,
            level: 'indices',
            metric: ['store']
        }, function(err, stats) {
            var stats = (err) ? {} : stats;
            stacks.groupByAuthor(function(err, data) {
                var stacks = {};
                if (!err) stacks = _.indexBy(data, '_id');
                res.send({
                    users: users,
                    stats: stats.indices,
                    stacks: stacks
                });
            });

        });
    }
};

exports.indexName = function(user) {
    return (user.roles.indexOf('subscriber') > -1) ? 'user-' + user.token : 'generic';
};

exports.findByEmail = function(email, cb) {

    var emails = (!_.isArray(email)) ? [email] : email;
    emails = _.map(emails, function(o) {
        return o.toLowerCase();
    });

    var query = {
        email: {
            $in: emails
        }
    };

    User.find(query).exec(function(err, users) {
        cb(err, users);
    });

};

exports.findById = function(req, res) {
    var uid = req.params.uid;
    if (!uid) return res.send(400, 'uid is require');
    _findById(uid, function(err, user) {
        if (err) return res.send(500, err);
        res.send(user);
    });
};

var _findById = exports._findById = function(id, cb) {
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err) return cb(err);
        cb(null, user);
    });
};

exports.isAdmin = function(req, res, next) {
    if (!req.user || req.user.roles.indexOf('admin') === -1)
        return res.send(401);
    next();
};


exports.getCollaborators = function(stack, integrations, cb) {
    var cids = [],
        data = {};
    if (!_.isArray(integrations)) integrations = [integrations];
    //:main must be the first one in the integrations array

    if (stack.collaborators)
        stack.collaborators.forEach(function(o) {
            if (o.status === 'accepted' && o.permissions && (o.permissions.indexOf('admin') !== -1 || o.permissions.indexOf('owner') !== -1)) cids.push(mongoose.Types.ObjectId(o.id.toString()));
        });

    if (stack.company && stack.company.collaborators)
        stack.company.collaborators.forEach(function(o) {
            if (o.status === 'accepted' && o.permissions && (o.permissions.indexOf('admin') !== -1 || o.permissions.indexOf('owner') !== -1)) cids.push(mongoose.Types.ObjectId(o.id.toString()));
        });

    User.find({
        _id: {
            $in: cids
        }
    }, function(err, users) {
        if (err) return cb(err);
        users.forEach(function(user) {

            var notifications = user.profile.notifications;
            var integration;

            for (var i = 0; i < integrations.length; i++) {
                integration = integrations[i];
                var main;
                if (integration.indexOf('main:') > -1) {
                    integration = integration.split('main:')[1];
                    main = true;
                }
                if (!notifications || !notifications[integration] || notifications[integration].active !== 'true') {
                    if (main) break; //break and check the next user
                    else continue; //check the next integration for this user
                }

                ['slack', 'email'].forEach(function(o) {
                    var frequency = notifications[integration].frequency;
                    if (notifications[integration].notifyBy && notifications[integration].notifyBy.indexOf(o) > -1) {
                        var pushObj;
                        switch (o) {
                            case 'email':
                                pushObj = user.email;
                                break;
                            case 'slack':
                                if (user.oauth_slack && user.oauth_slack.incoming_webhook) {
                                    pushObj = user.oauth_slack.incoming_webhook;
                                    pushObj.username = user.name;
                                }
                                break;
                            case 'pushNotification':
                                pushObj = data.user._id
                                break;
                        }
                        if (pushObj) {
                            data[o] = (data[o]) ? data[o] : ((o === 'email') ? {} : []);
                            if (o === 'email' && !data[o][frequency]) data[o][frequency] = [];
                            if (o === 'email') data[o][frequency].push(pushObj);
                            else data[o].push(pushObj);
                        }
                    }
                });
            };
        });

        cb(null, data);
    });
};

exports.removeCompany = function(company, users, cb) {
    users = _.map(users, '_id');
    User.update({
        _id: {
            $in: users
        }
    }, {
        $pull: {
            companies: {
                id: company._id
            }
        }
    }, {
        multi: true
    }).exec(function(err, numAffected) {
        return cb(err, numAffected);
    });
};

exports.findOne = function(req, res) {
    var user = _.pick(req.user, ['name', '_id', 'username', 'roles', 'profile', 'created', 'stripe', 'email', 'location', 'notifyBy', 'oauth_slack', 'oauth_slack', 'plan', 'companies']);
    res.json(user);
};

exports.socialLogin = function(req, res, next) {

    var provider = req.params.provider,
        providers = ['linkedin', 'github', 'googlePlus', 'facebook', 'google'],
        profile = req.body.profile,
        query = {};

    if (providers.indexOf(provider) === -1) return res.status(400).send('Provider ' + provider + ' is  not allowed');
    query[provider + '.id'] = profile.id;

    User.findOne(query, function(err, user) {
        if (err) return res.status(500).send(err);

        if (user) {
            stacksight.event({
                action: 'logged_in',
                type: 'user',
                name: user.name,
                icon: 'fa-user',
                icon_col: '#8C66B1'
            });
            return res.send(user);
        }

        next();
    });

};

exports.updateCompanyName = function(company, cb) {

    User.update({
        'companies.id': company.id,
    }, {
        '$set': {
            'companies.$.name': company.name,
        }
    }, {
        multi: true
    }, function(err, numAffected) {
        return cb(err);
    });
};

exports._find = function(query, cb) {
    User.find(query).exec(function(err, users) {
        return cb(err, users);
    });
};

exports.updateCompanyRole = function(companyId, uids, permissions, cb) {
    User.update({
        'companies.id': companyId,
        _id: {
            $in: uids
        }
    }, {
        '$set': {
            'companies.$.permission': permissions[0]
        }
    }, {
        multi: true
    }, function(err, numAffected) {
        return cb(err);
    });
};