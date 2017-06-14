'use strict';

var mongoose = require('mongoose'),
    App = mongoose.model('App'),
    Stack = mongoose.model('Stack'),
    async = require('async'),
    Elastic = require('../../providers/elastic')();


exports.counts = function(req, res) {

    Elastic.search({
        index: req.query.index,
        size: 0,
        body: {
            query: {
                range: {
                    created: {
                        gte: req.query.from || null,
                        lte: req.query.to || null
                    }
                }
            }
        }
    }, function(err, response) {
        if (err) return res.status(500).send(err);
        res.send(response)
    })

};

exports.userApps = function(req, res) {
    var uid = req.query.uid;

    var apps = {
        owner: [],
        collaborator: []
    };

    Elastic.search({
        index: 'apps',
        body: {
            query: {
                match: {
                    'collaborators.id': uid
                }
            }
        },
        size: 0
    }, function(err, response) {
        if (err) return res.status(500).send(err);

        Elastic.search({
            index: 'apps',
            body: {
                query: {
                    match: {
                        'collaborators.id': uid
                    }
                }
            },
            size: response.hits.total
        }, function(err, response) {
            if (err) return res.status(500).send(err);

            var stacks = []
            response.hits.hits.forEach(function(app, i) {
                stacks = stacks.concat(app._source.stacks)
                app._source._id = app._id
                if (app._source.author.toString() === uid) apps.owner.push(app._source);
                else apps.collaborator.push(app._source);
            });


            Elastic.search({
                index: 'stacks',
                body: {
                    query: {
                        ids: {
                            type: 'stacks',
                            values: stacks
                        }
                    }
                },
                size: stacks.length
            }, function(err, response) {
                if (err) return res.status(500).send(err);
                for (var n in apps.owner) {
                    let stacks = []
                    apps.owner[n].stacks.forEach(function(stack) {
                        var s = response.hits.hits.find(function(r) {
                            return r._id == stack });
                        if (!s) {
                            return }
                        s._source._id = s._id;
                        stacks.push(s._source);
                    })
                    apps.owner[n].stacks = stacks;
                }
                for (var n in apps.collaborator) {
                    let stacks = []
                    apps.collaborator[n].stacks.forEach(function(stack) {
                        var s = response.hits.hits.find(function(r) {
                            return r._id == stack });
                        if (!s) {
                            return }
                        s._source._id = s._id;
                        stacks.push(s._source);
                    })
                    apps.collaborator[n].stacks = stacks;
                }
                res.send(apps)
            })
        })
    })
};

exports.users = function(req, res) {

    var query = {
        query: {
            range: {
                created: {
                    gte: req.query.from,
                    lte: req.query.to,
                }
            }
        }
    }

    Elastic.search({
        index: 'users',
        size: 0,
        body: query
    }, function(err, response) {
        if (err) return res.status(500).send(err);
        Elastic.search({
            index: 'users',
            size: response.hits.total,
            body: query,
            _source: 'created'
        }, function(err, response){
            if (err) return res.status(500).send(err);
            res.send(response)
        })
    })
};

exports.stacks = function(req, res) {

    var platforms = ["mean", "drupal", "wordpress", "nodejs", "web", "php", "magento2", "meteor", "symfony2"]

    var body = platforms.map(function(platform) {
        return {
            size: 0,
            query: {
                match: {
                    platform: platform
                }
            }
        }
    });

    var i = 0;
    while (i < body.length) {
        body.splice(i, 0, { index: 'stacks' })
        i += 2;
    }

    Elastic.msearch({
        body: body
    }, function(err, response) {
        if (err) return res.status(500).send(err);
        var array = response.responses.map(function(res, index) {
            return {
                platform: platforms[index],
                count: res.hits.total
            }
        })
        res.send(array)
    })
};


exports.usersAndStacks = function(req, res) {

    Elastic.search({
        index: 'users',
        q: req.query.query || null,
        size: req.query.size,
        from: req.query.from,
        sort: req.query.sort,
        // filterPath: 'took,hits.hits._source,hits.hits._id',
        _source: 'created,email,name,roles,stripe,token,lastLogin,lastVisit'
    }, function(err, response) {
        if (err) return res.status(500).send(err);

        var users = response;
        if (!users.hits.hits.length) return res.send(users);

        var body = users.hits.hits.map(function(u) {
            return {
                size: 0,
                query: {
                    match: {
                        author: u._id
                    }
                }
            }
        });

        var i = 0;
        while (i < body.length) {
            body.splice(i, 0, { index: 'stacks' })
            i += 2;
        }

        Elastic.msearch({
            body: body
        }, function(err, response) {
            if (err) return res.status(500).send(err);

            for (var i = 0; i < response.responses.length; i++) {
                users.hits.hits[i]._source.stacks = response.responses[i].hits.total;
                users.took += response.responses[i].took;
            }
            res.send(users)
        })

    })
};


exports.stats = function(req, res) {
    Elastic.indices.stats({
        index: '*'
    }, function(err, response) {
        if (err) return res.status(500).send(err);
        res.send(response)
    })
};
