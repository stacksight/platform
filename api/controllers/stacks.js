require('../models/stack');
require('../models/stack1');
var mongoose = require('mongoose'),
    Stack = mongoose.model('Stack'),
    Stack1 = mongoose.model('Stack1'),
    _ = require('lodash'),
    apps = require('./apps'),
    users = require('./users'),
    producer = require('../producers'),
    appIdCtrl = require('./app-id'),
    Global = require('../services/global'),
    urlPattern = Global.urlPattern2,
    domainRegex = Global.domain,
    platformCtrl = require('./integrations/platform-sh'),
    tagsCtrl = require('./tags'),
    config = require(process.cwd() + '/config'),
    stacksight = require('../providers/stacksight'),
    mails = require('../providers/mails'),
    async = require('async'),
    Q = require('q'),
    utils = require('../services/utils'),
    companies = require('./companies'),
    activities = require('./activities');

exports.findOne = function(req, res) {
    if (req.currentCollaborator && req.currentCollaborator.permissions && req.currentCollaborator.permissions[0] === 'guest') {
        var exists = _.find(req.stack.collaborators, function(o) {
            return o.id && (o.id.toString() === req.user._id.toString());
        });
        if (!exists) return res.status(401).send('You are not a collaborator of this stack');
    }
    var options = [{
        path: 'company.owner',
        model: 'User',
        select: 'token'
    }];

    if (req.query.populate)
        options.push({
            path: 'collaborators.id',
            model: 'User',
            select: 'name profile.pictures.profile'
        });

    Stack.populate(req.stack, options, function(err, doc) {
        if (err || !doc) return res.send(500);
        res.json(doc);
    });
    // res.send(req.stack);
};

exports.create = function(req, res) {
    _create(req.body, req.user, req.company, function(err, stack) {
        if (err) return res.status(500).send(err);
        res.send(stack);
    });
};

exports.find = function(req, res, next) {
    // i can populate companies, check if collaborator.id exist, if exists 
    var companies = [],
        tags = req.query.tags;


    if (tags && tags.indexOf('undefined') > -1) {
        tags = tags.replace(',undefined', '');
        tags = tags.replace('undefined,', '');
    }

    req.user.companies.forEach(function(company) {
        if (['owner', 'admin'].indexOf(company.permission) > -1) companies.push(company.id);
    });

    var query = {
        $and: [{
            $or: [{
                'collaborators.id': { // guests and company members
                    $in: [req.user._id]
                }
            }, {
                company: {
                    $in: companies
                }
            }]
        }]
    };

    if (req.query.ids && req.query.ids !== 'undefined')
        query['$and'].push({
            _id: {
                $in: req.query.ids.split(',')
            }
        });

    if (tags && tags !== 'undefined')
        query['$and'].push({
            'tags.tag': {
                $all: tags.split(',')
            }
        });
    if (req.query.company && req.query.company !== 'undefined')
        query['$and'].push({
            'company': req.query.company
        });

    var populateQuery = (req.query.populate) ? [{
        path: 'company',
        select: 'name'
    }] : [];

    Stack.find(query).populate(populateQuery).exec(function(err, docs) {
        if (err) return res.send(500, 'Something bad happened.... Try again please.');
        if (req.path === '/stacks') return res.send(docs);
        req.stacks = docs;
        next();
    });
};

exports.byCollaborator = function(req, res, next) {

    var collaborator = req.params.userId,
        company = req.company,
        viewAllStacks;

    users._findById(collaborator, function(err, user) {

        if (err) return res.status(500).send(err);
        if (!user) return res.status(400).send('User does not exist');

        user.companies.forEach(function(_company) {
            if (_company.id !== company._id) return;
            if (['owner', 'admin'].indexOf(_company.permission) > -1) viewAllStacks = true;
        });

        var query = {
            company: company._id
        };

        if (!viewAllStacks)
            query['collaborators.id'] = user._id;

        Stack.find(query, {
            name: 1,
            platform: 1,
            tags: 1
        }).exec(function(err, docs) {
            if (err) return res.status(500).send('Something bad happened.... Try again please.');
            res.send(docs);
        });
    });
};

function checkSettings(body, stack, action) {
    // if (!body.host || (body.host === stack.host && action === 'update')) return;
    if (!body.host) return;
    var data = {
        appId: stack._id,
        mngToken: stack.author,
        url: body.host
    };
    producer.createJob('performance-sts', data, {
        priority: 100
    });
    producer.createJob('accessibility-sts', data, {
        priority: 100
    });
    // if (!stack.check)
    //     producer.createJob('availability-sts', data);
}


exports.update = function(req, res) {
    var action = req.body.action;
    if (!updateFunctions[action]) return res.send(501);
    updateFunctions[action](req, res);
};

var updateFunctions = {

    updateDetails: function(req, res) {

        var uneditableFields = ['tags', 'author', 'owner', 'company', 'currentIndex', 'collaborators'];

        uneditableFields.forEach(function(field) {
            delete req.body.stack[field];
        });

        var stack = req.stack;
        checkSettings(req.body.stack, stack, 'update');

        stack = _.extend(stack, req.body.stack);

        //tmp code for domain - because pre save is called after the field validation
        if (stack.host && !domainRegex.test(stack.domain)) {
            stack.domain = stack.host.replace('http://', '');
            stack.domain = stack.domain.replace('https://', '');
        }
        ////////////////////////////////////////

        var msg = '';
        _update(stack, function(err, doc) {
            // if (err) return res.send(500, 'Something bad happened.... Try again please.');
            if (err && err.errors) {
                for (var index in err.errors)
                    msg += err.errors[index].message + ' ';
                return res.status(500).send(msg);
            }
            if (err) return res.status(500).send(err.message);
            res.send(200);
        });
    },
    updateArray: function(req, res) {

        var body = req.body,
            object = body.object || req.object, // for add new tag;
            action = body.updateAction,
            array = body.array,
            key = body.key,
            stack = req.stack;

        if (key === 'tag' && object._id) {
            object.tag = object._id;
            if (object.company.toString() !== req.company._id.toString()) return res.status(401).send('You can not add this tag to ' + req.stack.name + ' stack');
        }

        var objIndex;
        stack[array].forEach(function(elem, index) {
            if (elem[key] && object[key] && elem[key].toString() === object[key].toString()) objIndex = index;
        });

        switch (action) {
            case 'add':
                if (objIndex) break;
                stack[array].addToSet(object);
                break;
            case 'remove':
                //TODO remove collaborator(update array) needs to be in permissions
                if (array === 'collaborators' && stack[array][objIndex].status === 'owner') return res.send(401);
                if (!objIndex && objIndex !== 0) return res.status(400).send('Object not found');
                var obj = {};
                obj[key] = stack[array][objIndex][key];
                stack[array].pull(obj);
                break;
            case 'update':
                //TODO make it generic !!!
                stack[array][objIndex].permissions = object.permissions;
                break;
            case 'disconnect':
                stack[array][objIndex].status = 'disconnected';
                stack[array][objIndex].id = null; //for stacks.find()
                break;
                // case 'confirmInvitation':
                //     stack.collaborators.forEach(function(collaborator) {
                //         if (object.email === collaborator.email.toLowerCase()) {
                //             collaborator.status = 'accepted';
                //             collaborator.acceptedDate = Date.now();
                //             collaborator.id = object._id;
                //         }
                //     });

                //     break;
        }
        stack.save(function(err, doc) {
            var msg = '';
            console[(err) ? 'error' : 'log'](err);


            if (err && err.errors) {
                for (var index in err.errors)
                    msg += err.errors[index].message + ' ';
                return res.status(500).send(msg);
            }
            if (err && err.message) return res.status(500).send(err.message);

            // if (action === 'add' && array === 'collaborators') return inviteCollaborator(req, res);

            res.send(doc);
        });
    }
};

var sendInvitationEmail = exports.sendInvitationEmail = function(company, host, users, stacks) {
    // loop on stacks - each stack needs seperate email;
    users.forEach(function(user) {
        stacks.forEach(function(stack) {
            var link;
            if (user._id) {
                link = config.dashboardHost + '/confirm/stack/' + stack._id + '?redirect=login';
                return sendEmail('invite', host, user, link, stack);
            }
            link = config.dashboardHost + '/confirm/stack/' + stack._id + '?redirect=register';
            sendEmail('register', host, user, link, stack);
        });
    });
}

function sendEmail(tpl, host, guest, link, stack) {
    mails.send(tpl, {
        to: guest.email,
        subject: host.name + ' has invited you to see insights for ' + stack.name,
        locals: {
            host: host.name,
            guest: (guest.name || guest.email),
            link: link,
            app: stack.name
        }
    }, function(err) {
        if (err) return console.error(err);
        console.log('INVITATION MAIL SENT SUCCESSFULLY');
        activities.register('stack', stack, host, 'add', host.name + ' added collaborator ' + guest.email + ' to ' + stack.name + ' stack');
    });
}

// exports.update = function(req, res) {

//     var stack = req.stack;
//     checkSettings(req.body, stack, 'update');

//     stack = _.extend(stack, req.body);
//     _update(stack, function(err, doc) {
//         if (err) return res.send(500, 'Something bad happened.... Try again please.');
//         res.send(200);
//     });
// };

var _update = exports._update = function(stack, cb) {
    delete stack.__v;
    stack.save(function(err, doc) {
        if (err) return cb(err);
        cb(null, doc);
    });
};

function initStack(project, company, user) {
    var stack = {},
        permissions = [];
    stack.name = project.name;
    stack.author = user._id;
    stack.owner = company.owner;
    stack.company = company;
    stack.platform = project.platform || 'web';
    stack.host = project.host || '';
    stack.domain = project.domain || '';
    stack.name = stack.name || stack.domain;
    stack.currentIndex = users.indexName(company.owner); // check the index
    permissions = (company.owner._id.toString() === user._id.toString()) ? ['owner'] : ['author'];
    stack.collaborators = [{
        id: user._id,
        status: 'accepted',
        email: user.email,
        permissions: permissions
    }];
    if (project.externalId) stack.externalId = project.externalId;
    if (project.source) stack.source = project.source;
    if (project.tags) {
        stack.tags = stack.tags || [];
        project.tags.forEach(function(tag) {
            var _tag = {
                tag: tag._id,
                value: tag.value,
                author: user._id
            }
            stack.tags.push(_tag);
        });
    }
    return stack;
}

var _create = exports._create = function(data, user, company, cb) {

    var stack = initStack(data, company, user);

    var msg = '';
    var stack = new Stack(stack);
    stack.save(function(err) {
        if (err && data.returnExistsDoc) {
            Stack.findOne({
                owner: stack.owner,
                domain: stack.domain
            }).exec(function(err, doc) {
                if (err) return cb(err);
                return cb(null, doc);
            });
        } else if (err && err.errors) {
            for (var index in err.errors)
                msg += err.errors[index].message + ' ';
            return cb(msg);
        } else if (err) return cb(err.message);

        else {
            company.stacks.addToSet(stack);
            company.save(function(err) {
                if (err) return cb(err);
                stack.company = company;
                checkSettings(stack, stack, 'create');
                activities.register('company', company, user, 'add', user.name + ' added stack ' + stack.name + ' to ' + company.name + ' company');
                cb(null, stack);
            });
        }
    });
};

exports.createPlatformStack = function(data, user, app, cb) {
    initStack(data, app, user, function(stack) {
        var integration = {};
        integration.active = false;
        integration.enable = false;
        integration.name = 'platform';
        integration.data = {
            project: data.project,
            environment: data.environment
        };
        stack.integrations = [integration];

        Stack.findOneAndUpdate({
            author: user._id,
            name: data.name
        }, {
            $set: stack
        }, {
            upsert: true,
            new: true
        }, function(err, _stack) {
            if (err) return cb({
                success: false,
                //msg: 'Something bad happened.... Try again please.',
                msg: JSON.stringify(err),
                status: 500
            });
            app.stacks.addToSet(_stack);
            app.save(function(err) {
                if (err) return cb({
                    success: false,
                    // msg: 'Something bad happened.... Try again please.',
                    msg: JSON.stringify(err),
                    status: 500
                });
                cb({
                    success: true,
                    stack: _stack
                });
            });
        });
    });
};

exports.stack = function(req, res, next) {
    var id = req.params.stackId;
    _stack(id, function(err, stack, company) {
        if (err) return res.status(500).send(err);
        req.stack = stack;
        req.company = company;
        next();
    });
};

var _stack = exports._stack = function(id, cb, skipValidation) {

    var options = [{
        path: 'company.owner',
        model: 'User',
        select: 'token roles email plan'
    }];

    if (skipValidation) {
        Stack1.findOne({
            _id: id
        }).populate('company').exec(function(err, stack) {
            if (err || !stack) return cb(err || 'stack does not exist');
            cb(null, stack, stack.company);
        });

    } else {
        Stack.findOne({
            _id: id
        }).populate('company').exec(function(err, stack) {
            Stack.populate(stack, options, function(err, doc) {
                if (err || !doc) return cb(err || 'stack does not exist');
                cb(null, doc, doc.company);
            });
        });
    }
};

exports.delete = function(req, res) {
    //add delete activity when delete works
    var id = req.params.stackId;

    Stack.remove({
        _id: id
    }, function(err) {
        if (err) return res.send(500, err);
        companies.stackDeleted({
            stackId: id
        }, function(err, data) {
            if (err) {
                console.error('Err stackDeleted: ', err);
                return res.status(500).send(err);
            }
            res.send(200);
        });
    });
};


exports.appDeleted = function(appId) {
    // Stack.update({
    //     app: appId
    // }, {
    //     $unset: {
    //         app: 1
    //     }
    // }, {
    //     multi: true
    // }, function(err, res) {
    //     console[(err) ? 'error' : 'log']('APP DELETED ERR', err, res);
    // });
    Stack.remove({
        app: appId
    }, function(err, res) {
        console[(err) ? 'error' : 'log']('APP DELETED ERR', err, res);
    });
};

exports.updateIndexName = function(user) {
    var index = users.indexName(user);
    Stack.update({
        owner: user._id
    }, {
        $set: {
            currentIndex: index
        }
    }, {
        multi: true
    }, function(err, numAffected) {
        if (err) {
            console.error('========================= CRITICAL ERROR =======================');
            console.error('indexName in stacks did not change');
        } else console.log('INDEX NAME OF STACK UPDATED TO: ', index);
    });
};

exports.findByIds = function(stacks, appIndex, cb) {
    Stack.find({
        _id: {
            $in: stacks
        }
    }).exec(function(err, docs) {
        if (err) return cb([], appIndex);
        cb(docs, appIndex);
    });
};

exports.groupByAuthor = function(cb) {
    var agg = [{
        $group: {
            _id: "$author",
            total: {
                $sum: 1
            }
        }
    }];

    Stack.aggregate(agg, function(err, counts) {
        cb(err, counts);
    });
};


exports.registerStack = function(req, res) {
    var message = {};
    message.data = req.body;
    message.data.token = req.user.token;
    appIdCtrl.create(message, req.user, function(err, data) {
        if (err) return res.status(500).send(err);
        res.send(data);
    });
};

exports.import = function(req, res, next) {
    var source = req.params.source;

    if (!importFrom[source]) return res.status(500).send('import from ' + source + ' is not supported yet');

    importFrom[source](req, function(err, data) {
        if (err) return res.status(500).send(err);
        res.send(data);
    });
};

exports.createFromSource = function(req, res, next) {
    var source = req.params.source;

    if (!createFrom[source]) return res.status(500).send('create from ' + source + ' is not supported yet');

    createFrom[source](req, function(err, data) {
        if (err) return res.status(500).send(err);
        return res.send(data);
    });
};

var importFrom = {

    platform: function(req, cb) {
        if (!req.body.token && (!req.user.oauth_platform || !req.user.oauth_platform.api_token)) return cb('Add your platform API token first');

        platformCtrl.projects(req.body.token, req.user, function(err, projects, user) {
            if (err) return cb(err);

            var oauth_platform = user.oauth_platform;
            oauth_platform.projects = projects;

            var set = {
                oauth_platform: oauth_platform
            };

            users.updateS(req.user._id, set, function(err, _user) {
                if (err) return cb(err);
                cb(null, {
                    upsession: {
                        key: 'user',
                        value: _user
                    },
                    user: _user
                });
            });
        });
    }
};


var createFrom = {

    platform: function(req, cb) {

        var projects = req.body.projects,
            i = 0;

        async.waterfall([
            async.apply(platformCtrl.sitesData, projects, req.user, req.company),
            // createStackLoop
        ], function(err, envs) {
            if (err) return cb(err);
            envs = envs.map(function(env) {
                env.returnExistsDoc = true;
                return env;
            });
            var data = {};
            data.sites = envs;
            _register(data, {}, req.user, req.company, function(err, _data) {
                cb(err, _data);
                users.updateS(req.user._id, {
                    'oauth_platform.projects': []
                }, function(err, user) {
                    console.log('remove platform projects from user object', err, user);
                });
            });
        });
    }
};

var _addCollaboratorsToStacks = exports._addCollaboratorsToStacks = function(src, host, company, collaborators, stacks, isAdmin, cb) {
    // collaborators include = {emails: for new users, objects = for selected users};
    // collaborator object contains: email, name and  isAdmin, if id exists - it is a known user
    // collaborators = array of emails
    // stacks - array of ids
    // src -> invited from company or from specific stack -> guest in company or member/admin in company
    async.parallel({
        users: function(callback) {
            var emails = _.map(collaborators, function(o) {
                if (typeof o === 'string') return o;
                return o.email;
            });

            users.findByEmail(emails, function(err, users) {
                if (err) return callback(err);
                var existEmails = _.map(users, function(o) {
                    return o.email;
                });
                var newEmails = _.difference(emails, existEmails);
                users = users.concat(_.map(newEmails, function(o) {
                    o = {
                        email: o,
                        name: (src === 'company') ? collaborators[0].name : o,
                        new: true
                    };
                    return o;
                }));
                callback(null, users);
            });
        },
        stacks: function(callback) {
            if ((!stacks || !stacks.length) && !isAdmin) return callback('You must specify stacks');
            if (src !== 'company' && isAdmin) return callback('You can not set admin role to stack collaborator, only to company collaborator');
            if (!stacks) return callback(null);

            var cStacks = JSON.parse(JSON.stringify(company.stacks));
            var includes = utils.arrayIncludesArray(cStacks, stacks);
            if (!includes) return callback('The stacks are not included in ' + company.name + ' company');
            Stack.find({
                _id: {
                    $in: stacks
                }
            }).exec(function(err, _stacks) {
                if (err) return callback(err);
                callback(null, _stacks);
            });
        }
    }, function(err, results) {
        if (err) return cb(err);
        updateStackCollaborators(src, results.users, results.stacks, isAdmin, 0, function(err, data) {
            if (err) return cb(err);
            companies.addCollaborators(src, company, results.users, isAdmin, function(err, _company) {
                if (err) return cb(err);
                cb(null, results.users, results.stacks);
            })
        });
    });
};

var _removeCollaboratorsFromStacks = exports._removeCollaboratorsFromStacks = function(src, host, company, collaborators, stacks, cb) {
    // collaborators = array of emails
    // stacks - array of ids
    // src -> DELETED from company or from specific stack
    async.parallel({
        users: function(callback) {
            var emails = collaborators;
            // return callback(null, emails);

            users.findByEmail(emails, function(err, users) {
                if (err) return callback(err);
                var existEmails = _.map(users, function(o) {
                    return o.email;
                });
                var newEmails = _.difference(emails, existEmails);
                users = users.concat(_.map(newEmails, function(o) {
                    o = {
                        email: o,
                        new: true
                    };
                    return o;
                }));

                var owner = _.find(users, function(o) {
                    return o._id && (o._id.toString() === company.owner._id.toString());
                });

                if (owner) return callback('You can not remove the company owner');

                callback(null, users);
            });
        },
        stacks: function(callback) {
            if ((!stacks || !stacks.length) && src !== 'company') return callback('You must specify stacks');
            if (!stacks) return callback(null);

            var cStacks = JSON.parse(JSON.stringify(company.stacks));
            var includes = utils.arrayIncludesArray(cStacks, stacks);
            if (!includes) return callback('The stacks are not included in ' + company.name + ' company');
            Stack.find({
                _id: {
                    $in: stacks
                }
            }).exec(function(err, _stacks) {
                if (err) return callback(err);
                callback(null, _stacks);
            });
        }
    }, function(err, results) {
        if (err) return cb(err);
        removeStackCollaborators(src, company, results.users, results.stacks, function(err) {
            if (err) return cb(err);
            if (src !== 'company') return cb(null);
            companies._removeCollaborators(company, results.users, function(err, _company) {
                if (err) return cb(err);
                users.removeCompany(company, results.users, function(err, _data) {
                    cb(null);
                });
            });
        });
    });
};

function removeStackCollaborators(src, company, users, stacks, cb) {
    // if src === company - remove all collaborator from stacks in the company
    // is src === stacks - remove all collaborator from stacks in company

    var collaborators = _.map(users, 'email');

    var query = {
        company: company._id
    };

    if (src !== 'company')
        query._id = {
            $in: _.map(stacks, '_id')
        };

    Stack.update(query, {
        $pull: {
            collaborators: {
                email: {
                    $in: collaborators
                }
            }
        }
    }, {
        multi: true
    }, function(err, numAffected) {
        cb(err);
    });
};


exports.updateDueConfirmation = function(src, user, company, stack, cb) {
    var query = {
        'collaborators.email': user.email,
        company: company._id
    };

    if (src === 'stack')
        query._id = stack._id;

    Stack.update(query, {
        '$set': {
            'collaborators.$.id': user._id,
            'collaborators.$.status': 'accepted',
            'collaborators.$.acceptedDate': Date.now()
        }
    }, {
        multi: true
    }, function(err, numAffected) {
        return cb(err, numAffected);
    });
};

function updateStackCollaborators(src, users, stacks, isAdmin, i, cb) {
    if (!stacks || !stacks.length) return cb(null);
    var collaborators = [];
    users.forEach(function(user) {
        var exist = _.find(stacks[i].collaborators, function(o) {
            return o.email === user.email;
        })
        if (exist) return;
        collaborators.push({
            email: user.email.toLowerCase(),
            permissions: (isAdmin) ? ['admin'] : ['viewer']
        });
    });
    Stack.findOneAndUpdate({
        _id: stacks[i]._id
    }, {
        $push: {
            collaborators: {
                $each: collaborators
            }
        }
    }, {
        new: true
    }).exec(function(err, doc) {
        if (err) return cb(err);
        i++;
        if (i === stacks.length) return cb(null); // out
        updateStackCollaborators(src, users, stacks, isAdmin, i, cb);
    });
};

exports.confirmInvitation = function(req, res) {
    companies._confirmInvitation(req, function(err, data) {
        if (err) return res.status(500).send(err);
        res.send(data);
    });
};


exports.register = function(req, res, next) {

    if (!req.body.sites) return res.status(400).send('sites array is required');

    var params = req.params;
    params.source = req.query.source;

    _register(req.body, params, req.user, req.company, function(err, data) {
        if (err) return res.status(400).send(err);
        res.send(data);
    });
};

var _register = exports._register = function(data, params, user, company, callback) {

    var sites = data.sites,
        main = _.find(sites, {
            'type': 'main'
        }),
        i = 0,
        response = {},
        mainTag = (main) ? main.domain : 'incoming';

    tagsCtrl._create(mainTag, user, company, function(err, tag) {
        if (err) return callback(err);
        mainTag = tag;
        loop(function(err, _data) {
            if (err) return callback(err);
            callback(null, _data);
        });
    });

    function loop(cb) {

        var siteData = {
            name: sites[i].title,
            platform: sites[i].platform || params.cms,
            host: sites[i].host,
            domain: sites[i].domain,
            tags: sites[i].tags || [mainTag],
            id: sites[i].id,
            externalId: sites[i].externalId || sites[i].id,
            returnExistsDoc: true,
            source: sites[i].source || params.source
        };

        _create(siteData, user, company, function(err, stack) {
            if (err) return cb(err);
            response[siteData.id] = stack._id;
            i++;
            if (i === sites.length) return cb(null, response);
            loop(cb);
        });
    }
};

exports._find = function(query, populateObj, cb) {

    Stack.find(query).populate(populateObj).exec(function(err, stacks) {
        if (stacks.length && populateObj)
            stacks = stacks.filter(function(stack) {
                return stack.owner && stack.author
            });
        return cb(err, stacks);
    });
};