'use strict';

var Elastic = require('../providers/elastic')(),
    users = require('../controllers/users'),
    _ = require('lodash'),
    Global = require('../services/global');

exports.generic = function(req, res) {
    var type = req.params.type;

    if (!types[type]) return res.send(404);

    types[type](req, res);
};

var types = {
    avgScore: function(req, res) {
        var stackId = req.params.stackId,
            options = {
                index: 'stack-health',
                type: 'stack-health',
                id: stackId
            };

        Elastic.get(options, function(error, response) {
            if (error) return res.send(500, error);
            if (!response._source.data.length) return res.send({});

            var dates = _.indexBy(response._source.data, 'key');
            dates = _.mapValues(dates, function(o) {
                o.types = _.map(o.types, function(t) {
                    return {
                        type: t.key,
                        score: t.avg
                    }
                });
                return o.types
            });
            res.send(dates);
        });
    }
};

exports.latestScore = function(req, res) {
    var options = {};
    options.size = 0;
    options.from = 0;

    var indexName = users.indexName(req._app.author);
    indexName = (indexName === 'generic') ? 'health*' : indexName + '-health' + Global.rollIndex;

    options.index = indexName;
    options.type = 'backups,security,seo,accessibility,performance';
    var stacksIds = _.map(req._app.stacks, '_id');

    options.body = {
        query: {
            bool: {
                must: [{
                    match_all: {}
                }],
                filter: {
                    terms: {
                        stackId: stacksIds
                    }
                }
            }
        },
        aggs: {
            types: {
                terms: {
                    field: '_type',
                    size: 10
                },
                aggs: {
                    stacks: {
                        terms: {
                            field: 'stackId',
                            size: 1000
                        },
                        aggs: {
                            'top-stacks-hits': {
                                top_hits: {
                                    _source: {
                                        include: ['data.calc_percent', 'stackId']
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
                }
            }

        }
    };

    Elastic.search(options, function(error, response) {
        if (error) return res.send(500, error);

        var types = _.indexBy(response.aggregations.types.buckets, 'key');
        var generalCnt = 0;
        var generalSum = 0;
        types = _.mapValues(types, function(t) {
            var stacks = _.indexBy(t.stacks.buckets, 'key');
            var cnt = 0;
            var sum = 0;
            stacks = _.mapValues(stacks, function(s) {
                if (!s['top-stacks-hits'].hits.hits[0]._source.data || !s['top-stacks-hits'].hits.hits[0]._source.data['calc_percent']) return null;
                cnt++;
                sum += s['top-stacks-hits'].hits.hits[0]._source.data['calc_percent'];
                return s['top-stacks-hits'].hits.hits[0]._source.data['calc_percent'];
            });
            t = {
                stacks: stacks
            };
            t.avgScore = (sum / cnt).toFixed(0);
            generalCnt++;
            generalSum += parseInt(t.avgScore);
            return t;
        });
        types['general'] = {
            avgScore: (generalSum / generalCnt).toFixed(0)
        };
        res.send({
            score: types
        });
    });
};
