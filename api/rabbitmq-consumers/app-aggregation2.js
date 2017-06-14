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

    message = JSON.parse(message);
    var index = message.index.indexOf('generic') > -1 ? 'health-*' : message.index + '-health',
        stackIds = _.pluck(message.stacks, '_id');



    async.parallel({
            security: function(callback) {

                if (!stackIds.length) return;
                var type = 'security';

                var options = {
                    index: index,
                    type: type,
                    stackIds: stackIds,
                    calc_percent: true
                };

                options = buildBaseQuery(options);

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
            seo: function(callback) {
                if (!stackIds.length) return;
                var type = 'seo';

                var options = {
                    index: index,
                    type: type,
                    stackIds: stackIds,
                    calc_percent: true
                };

                options = buildBaseQuery(options);

                Elastic.search(options, function(error, response) {
                    console.log('ELASTIC SEARCH SEO AGGREGATION ERROR: ', (error) ? error.status + ' ' + error.displayName : error);
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
            },
            performance: function(callback) {

                if (!stackIds.length) return;
                var type = 'performance';

                var options = {
                    index: index,
                    type: type,
                    stackIds: stackIds,
                    calc_percent: true
                };

                options = buildBaseQuery(options);

                Elastic.search(options, function(error, response) {
                    console.log('ELASTIC SEARCH PERFORMANCE AGGREGATION ERROR: ', (error) ? error.status + ' ' + error.displayName : error);
                    if (error) return callback(null, {
                        error: error.status
                    });
                    callback(null, {
                        data: response.aggregations
                    });
                });
            },
            accessibility: function(callback) {
                // accessibility
            }

        },
        function(err, results) {

            console.log('-----------RESULTS---------', err, results);
            if (err) return console.log('FINAL PARALLEL FUNCTION ERR', err);


        });

});

function buildBaseQuery(options) {

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
            date: {
                date_histogram: {
                    field: 'created',
                    interval: 'day',
                    format: 'yyyy/MM/dd HH:mm:ss',
                    min_doc_count: 1
                }
            }
        }
    };

    if (options.calc_percent) {
        options.body.aggs.date.aggs = {
            security_percents: {
                nested: {
                    path: 'data'
                },
                aggs: {
                    data: {
                        avg: {
                            field: 'data.calc_percent'
                        }
                    }
                }
            }
        };
    }

    delete options.stackIds;

    return options;
}
