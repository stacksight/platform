'use strict';

var Elastic = require('../providers/elastic')(),
    config = require(process.cwd() + '/config'),
    appsunIndexes = config.appsunIndexes,
    genericFilters = ['text', 'ip', 'session'],
    _ = require('lodash'),
    Global = require('../services/global');

exports.search = function(req, res) {

    var options = buildBaseQuery(req);

    options.body.sort = [{
        created: {
            order: 'desc'
        }
    }];

    var filters = (req.query.filters !== 'undefined') ? JSON.parse(req.query.filters) : {};
    for (var index in filters) {
        var searchKey = (genericFilters.indexOf(index) > -1) ? 'generic' : req.params.index;
        advancedSearch[searchKey][index](options, filters[index], req.params.index);
    };

    Elastic.search(options, function(error, response) {
        console[(error) ? 'error' : 'log']('ELASTIC SEARCH ERROR: ', error);
        if (error && error.status === '404') return res.send([]); //no data is not a search error
        if (error) return res.send(500);
        if (response.hits && response.hits.hits) return res.send(response.hits.hits);
        res.send([]);
    });

};

exports.aggregation = function(req, res) {
    var options = buildBaseQuery(req);
    var name = req.params.name;
    options.body.aggs = {};
    options.body.aggs[name] = aggregations[name];

    Elastic.search(options, function(error, response) {
        console[(error) ? 'error' : 'log']('ELASTIC AGGREGATION DATE ERROR: ', error);
        if (error && error.status === '404') return res.send([]); //no data is not a search error
        if (error) return res.send(500);
        if (response.aggregations) {
            if (name === 'health') sendLatestHealthData(response.aggregations[name].buckets);
            return res.send(response.aggregations[name].buckets);
        }
        res.send([]);
    });

};

function sendLatestHealthData(data) {
    data.forEach(function(type) {
        if (type.key === 'backups') return;
        // we need only the latest data of all the health types, except of backups
        type['top-types-hits'].hits.hits = type['top-types-hits'].hits.hits.slice(0,1);
    });
}


function buildBaseQuery(req) {

    var index = req.index,
        type = req.type,
        size = req.query.size,
        from = req.query.from,
        appId = (req.stacks) ? _.map(req.stacks, function(s) {
            return s._id;
        }) : [req.params.stackId];
       // appId = req.params.stackId; //,
    //token = req.user.token;


    if (from && size) from = size * from;

    var filter = {
        bool: {
            must: []
        }
    };

    filter.bool.must.push({
        terms: {
            appId: appId
        }
    });

    // filter.bool.must.push({
    //     term: {
    //         token: token
    //     }
    // });

    if (req.query.range && req.query.range !== 'undefined') {

        var fd = new Date(parseFloat(req.query.range.split(',')[0]));
        var td = new Date(parseFloat(req.query.range.split(',')[1]));
        filter.bool.must.push({
            range: {
                created: {
                    gte: fd,
                    lte: td
                }
            }
        });
    }


    return {
        index: index,
        type: type,
        from: from || 0,
        size: size || 0,
        body: {
            query: {
                bool: {
                    must: {
                        match_all: {}
                    },
                    filter: filter
                }
            }
        }
    }
}

var aggregations = {
    date: {
        date_histogram: {
            field: 'created',
            interval: 'day',
            format: 'yyyy/MM/dd HH:mm:ss',
            min_doc_count: 1
        }
    },
    ip: {
        terms: {
            field: 'ip'
        }
    },
    cpuMem: {
        terms: {
            field: 'session'
        },
        aggs: {
            'cpu': {
                avg: {
                    field: 'loadavg'
                }
            },
            'memory': {
                avg: {
                    field: 'memory'
                }
            }
        }
    },
    eventsKeys: {
        terms: {
            field: 'type'
        },
        aggs: {
            'subtypes': {
                terms: {
                    field: 'subtype',
                },
                aggs: {
                    'actions': {
                        terms: {
                            field: 'action'
                        }
                    }
                }
            },
            'actions': {
                terms: {
                    field: 'action',
                }
            }
        }
    },
    health: {
        terms: {
            field: "_type",
            size: 10
        },
        aggs: {
            'top-types-hits': {
                'top_hits': {
                    _source: {
                        include: ['data', 'appId', 'created', 'createdAt']
                    },
                    sort: [{
                        created: {
                            order: 'desc'
                        }
                    }],
                    size: 10
                }
            }
        }
    },
    inventory: {
        terms: {
            field: "appId",
            size: 1000
        },
        aggs: {
            'top-types-hits': {
                'top_hits': {
                    _source: {
                        include: ['data', 'appId', 'created']
                    },
                    sort: [{
                        created: {
                            order: 'desc'
                        }
                    }],
                    size: 1
                }
            }
        }
    }
};



var advancedSearch = {
    generic: {
        text: function(options, value, index) {
            delete options.body.query.bool.must.match_all;
            if (!options.body.query.bool.must.match) {
                options.body.query.bool.must.match = {};
            }

            var obj = {
                logs: 'content',
                events: 'data.description'
            };

            options.body.query.bool.must.match[obj[index]] = {
                query: value,
                type: 'phrase'
            };
        },
        session: function(options, session) {
            options.body.query.bool.filter.bool.must.push({
                term: {
                    session: session
                }
            });
        },
        ip: function(options, ip) {
            options.body.query.bool.filter.bool.must.push({
                term: {
                    ip: ip
                }
            });
        }
    },
    events: {
        types: function(options, types) {
            if (!options.body.query.bool.filter.bool.must_not) {
                options.body.query.bool.filter.bool.must_not = [];
            }
            var must_not = options.body.query.bool.filter.bool.must_not;

            for (var type in types) {
                for (var subtype in types[type]) {
                    for (var action in types[type][subtype]) {
                        console.log(type, subtype, action);
                        if (!types[type][subtype][action]) {
                            must_not.push({
                                bool: {
                                    must: []
                                }
                            });

                            if (subtype === 'sts_no_sub_type') {
                                must_not[must_not.length - 1].bool.must.push({
                                    missing: {
                                        field: 'subtype'
                                    }
                                });
                            } else {
                                must_not[must_not.length - 1].bool.must.push({
                                    term: {
                                        subtype: subtype
                                    }
                                });
                            }

                            must_not[must_not.length - 1].bool.must.push({
                                term: {
                                    action: action
                                }
                            });
                            must_not[must_not.length - 1].bool.must.push({
                                term: {
                                    type: type
                                }
                            });
                        }
                    }
                }
            }
        }
    }
};



exports.getIndex = function(req, res, next) {
    // req.index = [];

    // req.index.push(req.params.index + '-*');

    // if (user.roles.indexOf('subscriber') > -1) { //for example
    //     req.index.push('user-' + user.token);
    //     // req.range = {
    //     //     from: 'Date',
    //     //     to: 'Date'
    //     // };
    // }
    // req.type = req.params.type;
    // next();

    req.index = [];
    req.index.push(req.params.index + '-*');
    req.index.push('user-ss-*-' + req.params.index + Global.rollIndex);

    req.type = req.params.type;
    next();
};

exports.defaultData = function(message, cb) {

    var requiredFields = {
        session: 'default'
    };

    for (var index in requiredFields) {
        if (!message.data[index]) message.data[index] = requiredFields[index];
    }
    return cb(null);
};
