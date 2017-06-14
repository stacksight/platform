'use strict';

var Elastic = require('../providers/elastic')(),
    async = require('async'),
    _ = require('lodash'),
    producer = require('../producers'),
    mongoose = require('mongoose'),
    App = mongoose.model('App'),
    Global = require('../services/global');


//find all date > then the last in the history
//make new aggregation
//save after with cron all history (include the latest updates...)


module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    var index = message.index.indexOf('generic') > -1 ? 'health-*' : (message.index + '-health' + Global.rollIndex) ,
        stackIds = _.pluck(message.stacks, '_id');

    async.parallel({
            elastic: function(callback) {

                if (!stackIds.length) {
                    return callback('NO STACKS TO ' + message.groupId + ' GROUP');
                }
                var types = 'security,seo,accessibility,performance,backups';

                var options = {
                    index: index,
                    type: types,
                    stackIds: stackIds
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

            if (err && typeof(err) === 'string' && err.indexOf('NO STACKS') > -1) return done();

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
                    type.group_avg = type.group_avg.value;
                    type.stacks = _.map(type.stacks.buckets, function(stack) {
                        stack.score = stack.score.avg_per_stack.value;
                        return stack;
                    });
                    return type;
                });
                return date;
            });

            var data = {
                index: 'app-health',
                type: 'app-health',
                id: message.groupId,
                data: {
                    data: buckets
                },
                internalIndex: true
            };
            data.data.created = new Date().toISOString();

            producer.createJob('index-sts', data);
            done();

            App.update({
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
                    terms: {
                        appId: options.stackIds
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
                            stacks: {
                                terms: {
                                    field: 'appId',
                                    size: 1000
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
                            },
                            group_avg: {
                                avg_bucket: {
                                    buckets_path: 'stacks>score>avg_per_stack'
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    delete options.stackIds;

    return options;
}
