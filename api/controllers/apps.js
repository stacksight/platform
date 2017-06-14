require('../models/app');

var mongoose = require('mongoose'),
    stacks = require('./stacks'),
    users = require('./users'),
    _ = require('lodash'),
    App = mongoose.model('App'),
    request = require('request'),
    mails = require('../providers/mails'),
    config = require(process.cwd() + '/config'),
    stacksight = require('../providers/stacksight');


exports.create = function(req, res) {

    _create(req.user, req.body, function(data) {
        if (!data.success) return res.send(data.status, data.msg);
        res.json(data.app);
    });
};

var _create = exports._create = function(user, data, cb) {
    if (!data.name) return cb({
        success: false,
        msg: 'Name is required',
        status: 400
    });

    App.findOne({
        name: data.name,
        author: user._id
    }).populate('author').exec(function(err, doc) {
        if (err) return cb({
            success: false,
            status: 500,
            msg: 'Something bad happened.... Try again please.'
        });
        if (doc) return cb({
            success: false,
            msg: 'Can not save an existing app.',
            status: 403,
            app: doc
        });

        var app = data;
        app.author = user._id;
        app.created = Date.now();
        app.updated = Date.now();
        app.collaborators = [{
            id: user._id,
            email: user.email.toLowerCase(),
            status: 'owner',
            acceptedDate: Date.now()
        }];
        App.findOneAndUpdate({
            name: app.name,
            author: user._id
        }, {
            $set: app
        }, {
            new: true,
            upsert: true
        }).populate('author').exec(function(err, doc) {
            if (err) return cb({
                success: false,
                status: 500,
                msg: 'Something bad happened.... Try again please.'
            });
            if (doc.author && doc.author.email) return cb({
                success: true,
                app: doc
            });
            doc.author = user;
            cb({
                success: true,
                app: doc
            });
            stacksight.event({
                action: 'created',
                type: 'group',
                name: doc.name,
                user: {
                    name: user.name,
                    link: user.email
                },
                icon: 'fa-object-group',
                icon_col: '#FFA500'
            });
        });
    });
};

exports.slack_find_groups = function(req, res) {
    console.log('FIND GROUPS');
    App.find({
        'collaborators.id': {
            $in: [req.user._id]
        }
    }).exec(function(err, docs) {
        if (err) return res.send(500, 'Something bad happened.... Try again please.');

        var options = {
            url: req.slack.response_url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
        };

        if (docs && docs.length > 0) {
            var attachment_groups = [];
            docs.forEach(function(item) {
                attachment_groups.push({
                    title: item.name,
                    text: (item.stacks.length > 0) ? (item.stacks.length > 1) ? 'Contains *' + item.stacks.length + '* stacks' : 'Contains *' + item.stacks.length + '* stack' : 'Doesn\'t contain stacks',
                    color: "good",
                    mrkdwn_in: ["text"]
                });
            });
            options.body = {
                response_type: 'in_channel',
                text: 'Found ' + docs.length + ' groups',
                attachments: attachment_groups
            };

            request.post(options, function(err, httpResponse, body) {
                res.send(httpResponse, body);
            });

        } else {
            options.body = {
                response_type: 'in_channel',
                text: 'Found ' + docs.length + ' groups',
                attachments: attachment_groups
            };

            request.post(options, function(err, httpResponse, body) {
                res.send(httpResponse, body);
            });
        }
    });
};


exports.slack_info_group = function(req, res) {
    console.log(req.slack.group);

    App.findOne({
        'collaborators.id': {
            $in: [req.user._id]
        },
        'name': {
            '$regex': new RegExp("^" + req.slack.group + '$', "i")
        }
    }).exec(function(err, doc) {
        if (err) return res.send(500, 'Something bad happened.... Try again please.');
        var options = {
            url: req.slack.response_url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
        };

        if (doc) {
            var stacks_count = doc.stacks.length;
            var collaborators_count = doc.collaborators.length;
            var owner = _.find(doc.collaborators, {
                status: 'owner'
            });
            options.body = {
                response_type: 'in_channel',
                attachments: [{
                    title: req.slack.group.toUpperCase() + " group",
                    text: "*Stacks:* " + stacks_count + "\n *Team collaborators:* " + collaborators_count + "\n *Owner:* " + owner.email,
                    color: 'good',
                    mrkdwn_in: ["text"]
                }]
            };
            request.post(options, function(err, httpResponse, body) {
                res.send(httpResponse, body);
            });

        } else {
            options.body = {
                response_type: 'in_channel',
                attachments: [{
                    title: 'Not found',
                    text: 'Group "' + req.slack.group.toUpperCase() + '" not found',
                    color: "danger"
                }]
            };

            request.post(options, function(err, httpResponse, body) {
                res.send(httpResponse, body);
            });
        }
    });
};

exports.slack_find_stacks = function(req, res) {
    App.findOne({
        'collaborators.id': {
            $in: [req.user._id]
        },
        'name': {
            '$regex': new RegExp("^" + req.slack.group + '$', "i")
        }
    }).exec(function(err, doc) {
        if (err) return res.send(500, 'Something bad happened.... Try again please.');
        var options = {
            url: req.slack.response_url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
        };

        if (doc && doc.stacks.length > 0) {
            stacks.findByIds(doc.stacks, 0, function(data) {
                var attachments = [];
                data.forEach(function(item) {
                    attachments.push({
                        title: item.name,
                        text: "*Platform:* " + item.platform + "\n *Host:* " + item.host,
                        color: "good",
                        mrkdwn_in: ["text"]
                    });
                });
                options.body = {
                    response_type: 'in_channel',
                    text: "Stacks for \"" + req.slack.group + "\" group",
                    attachments: attachments
                };
                request.post(options, function(err, httpResponse, body) {
                    res.send(httpResponse, body);
                });
            });
        } else {
            options.body = {
                response_type: 'in_channel',
                attachments: [{
                    title: 'Stacks not found',
                    text: req.slack.group + " group doesn\'t have any stacks",
                    color: 'danger'
                }]
            };
            request.post(options, function(err, httpResponse, body) {
                res.send(httpResponse, body);
            });
        }
    });

};

exports.find = function(req, res) {
    console.time('find-stacks-populate');
    var populateQuery = [
        /*{
                path: 'stacks',
                select: 'name created platform'
            },*/
        {
            path: 'collaborators.id',
            select: 'profile.pictures name'
        }
    ];
    App.find({
        'collaborators.id': {
            $in: [req.user._id]
        }
    }).populate(populateQuery).exec(function(err, docs) {
        if (err) return res.send(500, 'Something bad happened.... Try again please.');
        console.timeEnd('find-stacks-populate');
        res.send(docs);
    });

    // console.time('find-stacks');
    // App.find({
    //     collaborators: {
    //         $in: [req.user._id]
    //     }
    // }).exec(function(err, docs) {
    //     if (err) return res.send(500, 'Something bad happened.... Try again please.');
    //     var index = 0;
    //     docs = docs.map(function(d) {
    //         return d.toObject()
    //     });

    //     for (var i in docs) {
    //         stacks.findByIds(docs[i].stacks, i, function(stacks, appIndex) {
    //             docs[appIndex].stacks = stacks;
    //             index++;
    //             if (index === docs.length) {
    //                 console.timeEnd('find-stacks');
    //                 // res.send(docs);
    //             }
    //         });
    //     }
    // });
};

exports.findOne = function(req, res) {
    return res.send(req._app);
};


exports.update = function(req, res) {

    var action = req.body.action;
    updateFunctions[action](req, res);

};


var updateFunctions = {

    addStack: function(req, res) {
        stacks.addStackToApp(req, res, function(stack) {
            req._app.stacks.push(stack);
            req._app.save(function(err) {
                if (err) return res.send(500, 'Something bad happened.... Try again please.');
                stacksight.event({
                    action: 'added stack to',
                    type: 'group',
                    name: req._app.name,
                    user: {
                        name: req.user.name,
                        link: req.user.email
                    },
                    icon: 'fa-object-group',
                    icon_col: '#FFA500'
                });
                res.json(stack);
            });
        });
    },

    updateDetails: function(req, res) {
        var app = req._app;

        app = _.extend(app, req.body.app);

        app.save(function(err) {
            if (err) return res.send(500, 'Something bad happened.... Try again please.');
            stacksight.event({
                action: 'updated',
                type: 'group',
                name: app.name,
                user: {
                    name: req.user.name,
                    link: req.user.email
                },
                icon: 'fa-object-group',
                icon_col: '#FFA500'
            });
            res.send(200);
        });
    },
    updateArray: function(req, res) {
        var body = req.body,
            object = body.object,
            action = body.updateAction,
            array = body.array,
            key = body.key,
            app = req._app;

        var objIndex;
        app[array].forEach(function(elem, index) {
            if (elem[key] === object[key]) objIndex = index;
        });

        switch (action) {
            case 'add':
                if (objIndex) break;
                app[array].addToSet(object);
                break;
            case 'remove':
                //TODO remove collaborator(update array) needs to be in permissions
                if (app[array][objIndex].status === 'owner') return res.send(401);
                app[array].pull({
                    _id: app[array][objIndex]._id
                });
                break;
            case 'update':
                //TODO make it generic !!!
                app[array][objIndex].permissions = object.permissions;
                break;
            case 'disconnect':
                app[array][objIndex].status = 'disconnected';
                app[array][objIndex].id = null; //for apps.find()
                break;
            case 'confirmInvitation':
                app.collaborators.forEach(function(collaborator) {
                    if (object.email === collaborator.email.toLowerCase()) {
                        collaborator.status = 'accepted';
                        collaborator.acceptedDate = Date.now();
                        collaborator.id = object._id;
                    }
                });
                stacksight.event({
                    action: 'confirmed invitation',
                    type: 'group',
                    name: app.name,
                    user: {
                        name: req.user.name,
                        link: req.user.email
                    },
                    icon: 'fa-object-group',
                    icon_col: '#FFA500'
                });
                break;
        }
        app.save(function(err, doc) {
            console[(err) ? 'error' : 'log'](err);
            if (err) return res.send(500, 'Something bad happened.... Try again please.');

            if (action === 'add' && array === 'collaborators') return inviteCollaborator(req, res);

            res.send(doc);
        });
    }
};

exports.app = function(req, res, next) {
    var populateQuery = [];
    var populate = req.query.populate;

    var populateObj = {
        stacks: {
            path: 'stacks',
            select: 'name created platform host data updated'
        },
        author: {
            path: 'author',
            select: 'roles token'
        }
    };

    if (!populate) populateQuery = _.values(populateObj);
    else {
        populate = populate.split(',');
        for (var index in populate) {
            if (populateObj[populate[index]])
                populateQuery.push(populateObj[populate[index]]);
        }
    }

    App.findOne({
        _id: req.params.appId
    }).populate(populateQuery).exec(function(err, doc) {
        if (err || !doc) return res.send(500, 'Something bad happened.... Try again please.');
        req._app = doc;
        next();
    });
};

exports.stackDeleted = function(data, cb) {
    var query = {};
    var stackId = data.stackId;

    if (data.appId) query._id = data.appId;
    else query.stacks = {
        $in: [stackId]
    };
    App.update(query, {
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

exports.hasPermissions = function(req, res, next) {
    var owner = req._app.author.equals(req.user._id) || (req.stack && req.stack.author.equals(req.user._id));
    if (owner) return next();


    var collaborator;
    req._app.collaborators.forEach(function(c) {
        if (c.email.toLowerCase() === req.user.email) collaborator = c;
    });

    if (!collaborator) return res.status(401).send('User is not authorized');

    switch (req.method) {
        case 'GET': //viewers
            if (collaborator) return next();
            break;
        case 'PUT': //update
            if (collaborator.permissions.indexOf('admin') > -1 ||
                (req.body.array === 'collaborators' && (req.body.updateAction === 'disconnect' || req.body.updateAction === 'confirmInvitation')))
                return next();
            break;
        default:
            res.status(401).send('User is not authorized');
    }
    res.status(401).send('User is not authorized');
};

exports.delete = function(req, res) {
    var id = req.params.appId;

    App.remove({
        _id: id
    }, function(err) {
        if (err) return res.send(500, err);
        stacksight.event({
            action: 'deleted',
            type: 'group',
            name: req._app.name,
            user: {
                name: req.user.name,
                link: req.user.email
            },
            icon: 'fa-object-group',
            icon_col: '#FFA500'
        });
        stacks.appDeleted(id);
        res.send(200);
    });

};

function sendEmail(tpl, host, guest, res, link, app) {
    mails.send(tpl, {
        to: guest.email,
        subject: tpl,
        locals: {
            host: host.name,
            guest: (guest.name || guest.email),
            link: link,
            app: app
        }
    }, function(err) {
        if (err) return res.send(500, err);
        res.send(200);
    });
}


function inviteCollaborator(req, res) {
    app = req._app;
    var collaborator = req.body.object;
    if (collaborator.email.toLowerCase() === req.user.email) return res.send(500, 'You can not invite yourself');
    users.findByEmail(collaborator.email, function(err, user) {
        if (err) return res.send(500, err);

        stacksight.event({
            //action: 'invenited ' + ((user) ? user.name : collaborator.email) + ' as a collaborator',
            action: 'invited ' + ((user) ? user.name : collaborator.email) + ' to ',
            type: 'group',
            name: app.name,
            user: {
                name: req.user.name,
                link: req.user.email
            },
            icon: 'fa-object-group',
            icon_col: '#FFA500'
        });

        var link;
        if (user) {
            link = config.dashboardHost + '/confirm/app/' + app._id + '?redirect=login';
            return sendEmail('invite', req.user, user, res, link, app.name);
        }
        link = config.dashboardHost + '/confirm/app/' + app._id + '?redirect=register';
        sendEmail('register', req.user, collaborator, res, link, app.name);
    });
}


exports.addExistingStack = function(user, data, cb) {
    App.findOneAndUpdate({
        _id: data.appId,
        collaborators: {
            $elemMatch: {
                id: user._id,
                $or: [{
                    permissions: {
                        $in: ['admin']
                    }
                }, {
                    status: 'owner'
                }]
            }
        }
    }, {
        $addToSet: {
            stacks: data.stackId
        }
    }, function(err, doc) {
        if (err) return cb(err);
        if (!doc) return cb('You have no permissions to update destination group');

        cb(null, doc);
    });
};
