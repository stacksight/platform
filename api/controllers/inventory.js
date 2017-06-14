'use strict';

var _ = require('lodash'),
    Elastic = require('../providers/elastic')(),
    stacks = require('../controllers/stacks'),
    users = require('../controllers/users'),
    producer = require('../producers'),
    utils = require('../services/utils'),
    typesNames = ['plugin', 'module', 'theme', 'package'],
    Global = require('../services/global'),
    types = {};


function init() {
    typesNames.forEach(function(type) {
        var path = '../models/extensions/' + type;
        types[type] = {
            model: require(path)
        };
    });
}

init();


//elastic_id : will be platform_name_version
exports.data = function(message, user, cb) {

    //inventory per stack - elastic is overriding the last inventory of the stack
    message.id = message.data.appId.toString();
    message.data.calculatedId = message.data.appId;

    var components = message.data.data;
    if (!_.isArray(components)) return cb();

    components.forEach(function(component) {
        if (!component.label) return;

        component.platform = message.data.platform;
        component.nameNversion = component.label + ' ' + component.version;
        component.appId = message.data.appId;
        component.token = message.data.token;
        component.name = component.name || component.label.toLowerCase();

        var id = component.platform + '_' + component.name + '_' + component.version + '_' + component.appId;
        id = id.replace(/\s/g, '');

        component.calculatedId = id;
        //index extension in elastic for search
        //save schema in mongo
        mongoExtension(component, function(err) {
            //index in elastic only if not exists
            // if (!err) elasticExtension(component);
        });

        elasticExtension(component, user);
    });
    cb();
};

function elasticExtension(component, user) {

    var indexName = users.indexName(user);
    indexName = (indexName === 'generic') ? utils.indexNameByDate('extensions') : indexName + '-extensions';

    var data = {
        index: indexName,
        originalIndex: 'extensions',
        type: 'extension',
        data: component,
        id: component.calculatedId
    };

    data.data.created = new Date().toISOString();
    producer.createJob('translation-sts', data);

    //index one without version
    var _data = JSON.parse(JSON.stringify(data));
    var _id = component.platform + '_' + component.name + '_' + component.appId;

    _data.id = _id;
    _data.data.nameNversion = _data.data.label;
    delete _data.data.version;
    producer.createJob('translation-sts', _data);
}

function mongoExtension(component, cb) {
    var type = component.type;
    if (!types[type]) return console.error('=============== CREATE NEW MONGOOSE SCHEMA TO ' + type + ' EXTENSION =============');
    var extension = new types[type].model(component);
    extension.save(function(err, data) {
        console[(err) ? 'error' : 'log']('=========== MONGO SAVE EXTENSION ERR:', err);
        cb(err);
    });
}

exports.search = function(req, res) {

    var stackIds = _.map(req.stacks, '_id'),
        index = [],
        iName, filter, must = [],
        searchFields, options, name, version;

    searchFields = ['name', 'version'];
    name = req.query.name;
    version = req.query.version;

    if (!name) return res.status(400).send('Name parameter is missing');

    index.push('inventory-*');
    index.push('user-ss-*-inventory' + Global.rollIndex);

    filter = {
        bool: {
            must: []
        }
    };

    filter.bool.must.push({
        terms: {
            appId: stackIds
        }
    });

    filter.bool.must.push({
        ids: {
            type: 'inventory',
            values: stackIds
        }
    });

    // var o;
    // searchFields.forEach(function(field) {
    //     if (req.query[field]) {
    //         o = { match: {} };
    //         o.match['data.' + field] = req.query[field];
    //         must.push(o);
    //     }
    // });

    // filter.bool.must.push({
    //     nested: {
    //         path: 'data',
    //         query: {
    //             bool: {
    //                 must: must
    //             }
    //         }
    //     }
    // });

    options = {
        index: index,
        type: 'inventory',
        from: 0,
        size: 0,
        body: {
            query: {
                bool: {
                    must: {
                        match_all: {}
                    },
                    filter: filter
                }
            },
            aggs: {
                stacks: {
                    terms: {
                        field: "appId",
                        size: 3000
                    },
                    aggs: {
                        'top-stacks-hits': {
                            'top_hits': {
                                _source: {
                                    include: ['appId', 'data']
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

    Elastic.search(options, function(error, response) {
        console[(error) ? 'error' : 'log']('ELASTIC SEARCH INVENTORY ERROR: ', error);
        if (error) return res.send(500);
        if (!response.aggregations) res.send([]);
        var stacksIds = [];

        response.aggregations.stacks.buckets.forEach(function(stack) {
            if (stack['top-stacks-hits'].hits.hits && stack['top-stacks-hits'].hits.hits.length && stack['top-stacks-hits'].hits.hits[0]._source.data) {
                stack['top-stacks-hits'].hits.hits[0]._source.data.forEach(function(o) {
                    if (!o.name) return;
                    if ((o.name.toLowerCase().trim().indexOf(name.toLowerCase().trim()) > -1 || o.label.toLowerCase().trim().indexOf(name.toLowerCase().trim()) > -1) && (version === o.version || !version)) {
                        stacksIds.push(stack.key);
                        return;
                    }
                });
            }
        });
        stacks.findByIds(stacksIds, 0, function(data) {
            return res.send(data);
        });
    });
};

exports.info = function(req, res, next) {
    var stackIds = _.map(req.stacks, '_id'),
        index = [],
        iName, filter, must = [],
        options;

    index.push('inventory-*');
    index.push('user-ss-*-inventory' + Global.rollIndex);

    filter = {
        bool: {
            must: []
        }
    };

    filter.bool.must.push({
        terms: {
            appId: stackIds
        }
    });

    options = {
        index: index,
        type: 'inventory',
        from: 0,
        size: 0,
        body: {
            query: {
                bool: {
                    must: {
                        match_all: {}
                    },
                    filter: filter
                }
            },
            aggs: {
                stacks: {
                    terms: {
                        field: 'appId',
                        size: 1000
                    },
                    aggs: {
                        data: {
                            "scripted_metric": {
                                "init_script": "_agg['count_all'] = 0; _agg['count_active'] =  0;  _agg['active_themes'] = ''",
                                "map_script": "_agg['count_all'] = _source['data'].size(); for (t in _source['data']) {if (t.active == true)  _agg['count_active'] ++; if(t.type == 'theme' && t.current == true) _agg['active_themes'] += t.label;};"
                            }
                        }
                    }
                }
            }
        }
    }


    Elastic.search(options, function(error, response) {
        console[(error) ? 'error' : 'log']('ELASTIC SEARCH INVENTORY INFO ERROR: ', error);
        if (error) return res.send(500);
        if (!response.aggregations || !response.aggregations.stacks.buckets.length) return res.send({});
        var stacks = _.indexBy(response.aggregations.stacks.buckets, 'key');
        stacks = _.mapValues(stacks, function(o) {
            return o.data.value[0];
        });
        res.send(stacks);
    });
};
