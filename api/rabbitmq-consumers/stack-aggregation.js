'use strict';

require('../models/stack1')

var Elastic = require('../providers/elastic')(),
    async = require('async'),
    _ = require('lodash'),
    producer = require('../producers'),
    mongoose = require('mongoose'),
    Stack1 = mongoose.model('Stack1'),
    Global = require('../services/global');


//find all date > then the last in the history
//make new aggregation
//save after with cron all history (include the latest updates...)


module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    var index = message.index.indexOf('generic') > -1 ? 'health-*' : (message.index + '-health' + Global.rollIndex),
        stackId = message.id;

    async.parallel({
            elastic: function(callback) {

                if (!stackId) return callback('STACKID IS MISSING');

                var types = 'security,seo,accessibility,performance,backups';

                var options = {
                    index: index,
                    type: types,
                    stackId: stackId
                };

                options = buildQuery(options);

                Elastic.search(options, function(err, response) {
                    if (err) {
                        console.error('ELASTIC SEARCH HEALTH AGGREGATION ERROR: ', err.status + ' ' + err.displayName);
                        return callback(null, {
                            error: err.status
                        });
                    }
                    callback(null, {
                        data: response.aggregations
                    });
                });
            },
            availability: function(callback) {
                return callback(null);
            }
        },
        function(err, results) {

            if (err) {
                error(err);
                return console.error('FINAL PARALLEL FUNCTION ERR', err);
            }

            if (results.elastic.error || !results.elastic.data || !results.elastic.data.dates.buckets.length) {
                done();
                return console.log('-------- APP AGGREGATION - NO DATA --------------');
            }


            var buckets = results.elastic.data.dates.buckets;

            buckets = _.map(buckets, function(date) {
                date.types = _.map(date.types.buckets, function(type) {
                    type.avg = type.score.avg_per_stack.value;
                    
                    return type;
                });
                return date;
            });

            var data = {
                index: 'stack-health',
                type: 'stack-health',
                id: stackId,
                data: {
                    data: buckets
                },
                internalIndex: true
            };
            data.data.created = new Date().toISOString();

            producer.createJob('index-sts', data);
            done();

            Stack1.update({
                _id: message.groupId
            }, {
                $set: {
                    'updatedDates.healthPoints': data.data.created
                }
            }, {
                multi: false
            }).exec(function(err, numEfected) {
                console[(err) ? 'error' : 'log']('========= UPDATE APP HEALTH POINTS =================', err, numEfected);
            });

        });

};

function buildQuery(options) {

    options.size = options.size || 0;
    options.from = options.from || 0;
    options.body = {
        query: {
            bool: {
                must: [],
                filter: {
                    term: {
                        appId: options.stackId
                    }
                }
            }
        },
        aggs: {
            dates: {
                date_histogram: {
                    field: 'created',
                    interval: 'day',
                    format: 'yyyy/MM/dd HH:mm:ss',
                    min_doc_count: 1
                },
                aggs: {
                    types: {
                        terms: {
                            field: '_type',
                            size: 10
                        },
                        aggs: {
                            score: {
                                nested: {
                                    path: 'data'
                                },
                                aggs: {
                                    avg_per_stack: {
                                        avg: {
                                            field: 'data.calc_percent'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    delete options.stackId;

    return options;
};