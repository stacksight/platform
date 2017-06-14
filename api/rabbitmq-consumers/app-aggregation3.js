// 'use strict';


var q = require('../providers/busmq').get('app-aggregation-sts');
q.consume();

var Elastic = require('../providers/elastic')(),
    async = require('async'),
    _ = require('lodash');


//find all date > then the last in the history
//make new aggregation
//save after with cron all history (include the latest updates...)


q.on('message', function(message) {
    // return console.log(message);

    message = JSON.parse(message);
    var index = message.index.indexOf('generic') > -1 ? 'health-*' : message.index + '-health',
        stackIds = _.pluck(message.stacks, '_id');

    async.parallel({
            elastic: function(callback) {

                if (!stackIds.length) return;
                var types = 'security,seo,accessibility,performance';

                var options = {
                    index: index,
                    type: types,
                    stackIds: stackIds
                };

                options = buildQuery(options);

                Elastic.search(options, function(error, response) {
                    console.log('ELASTIC SEARCH SECURITY AGGREGATION ERROR: ', (error) ? error.status + ' ' + error.displayName : error);
                    if (error) return callback(null, {
                        error: error.status
                    });
                    callback(null, {
                        data: response.aggregations
                    });
                });
            },
            availability: function(callback) {
                // message.stacks.forEach(function(stack) {
                //     if (!stack.check) return;
                //     var objReq = {
                //         uri: uptimeHost + '/dashboard/checks',
                //         method: 'POST',
                //         form: {
                //             check: {
                //                 url: message.url,
                //                 name: message.url,
                //                 interval: 60,
                //                 maxTime: 1500,
                //                 alertTreshold: 1,
                //                 tags: ['from api']
                //             }
                //         },
                //         headers: {
                //             'Content-Type': 'multipart/form-data'
                //         }
                //     };

                //     request(objReq, function(error, response, body) {
                //         if (!error && response.statusCode < 400 && response.body.length) {
                //             console.log(JSON.parse(body));
                //             var check = JSON.parse(body);
                //             Stack.findOneAndUpdate({
                //                 _id: message.appId
                //             }, {
                //                 $set: {
                //                     check: check._id
                //                 }
                //             }, function(err, stack) {
                //                 if (err) return console.log(' =============== MONGO SAVE CHECK ERR ================= ', err);
                //                 console.log('========== MONGO SAVE CHECK SUCCESS =================');
                //             });
                //             console.log('@@@@@@@@ CREATE CHECK SUCCESS @@@@@@@@@@@@@@@@', response);
                //         } else {
                //             console.log('@@@@@@@@ CREATE CHECK ERROR @@@@@@@@@@@@@@@@', error);
                //         }
                //     });
                // });
                return callback(null);
            }
        },
        function(err, results) {

            if (err) return console.log('FINAL PARALLEL FUNCTION ERR', err);
            console.log('-----------RESULTS---------', err, results);
            console.log(results.elastic.data);
            console.log('orit2', _.has(results, 'elastic.error'));

            console.log('-----------RESULTS---------&&&&&');
            return; // console.log(JSON.stringify(results));

            if (results.elastic.error) return console.log('-------- APP AGGREGATION - NO DATA --------------');


            // return console.log(results.elastic, 'orit4');
            // if (results.elastic && results.elastic.data && results.elastics.data.dates && results.elastic.data.dates.buckets) {
            //     return console.log('orit3');
            // }


            // return console.log('orit2', _.has('results.elastic.data.dates.buckets'));
            // if (!_.has('response.elastic.data.dates.buckets')) return console.log('-------- APP AGGREGATION - NO DATA --------------');

            // var buckets = response.elastic.data.dates.buckets;
            // _.map(buckets, function(date) {
            //     date.types = _.map(date.types.buckets, function(type) {
            //         return {
            //             key: type.key,
            //             val: type.calc_percents.avg_calc_percents.value
            //         }
            //     });
            //     return date;
            // });

            var data = {
                index: 'app-health',
                type: 'health',
                id: message.groupId,
                data: buckets,
                internalIndex: true
            };
            data.data.created = new Date().toISOString();

            console.log('********');
            // producer.createJob('index-sts', data);

        });

});

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
                            calc_percents: {
                                nested: {
                                    path: 'data'
                                },
                                aggs: {
                                    avg_calc_percents: {
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

    delete options.stackIds;

    return options;
}
