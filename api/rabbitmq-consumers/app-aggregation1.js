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

    //it could be multiple types: health, security,performance, etc...
    //we'll search it by data.category
    async.parallel({
            security: function(callback) {

                if (!stackIds.length) return;

                var type = 'security';
                var options = {
                    size: 0,
                    from: 0,
                    index: index,
                    type: types,
                    body: {
                        query: {
                            bool: {
                                must: [{
                                    nested: {
                                        path: 'data',
                                        query: {
                                            bool: {
                                                must: [{
                                                    match: {
                                                        'data.category': 'security'
                                                    }
                                                }]
                                            }
                                        }
                                    }
                                }],
                                filter: {
                                    terms: {
                                        'appId': stackIds
                                    }
                                }
                            }
                        },
                        aggs: {
                            'date': {
                                date_histogram: {
                                    field: 'created',
                                    interval: 'day',
                                    format: 'yyyy/MM/dd HH:mm:ss',
                                    min_doc_count: 1
                                },
                                aggs: {
                                    'security_percents': {
                                        scripted_metric: {
                                            init_script: '_agg.test = []',
                                            map_script: 'for (int i = 0; i < _source.data.size(); i++) {' +
                                                ' if (_source.data[i].category == \"security\") {' +
                                                'for (int j = 0; j < _source.data[i].widgets.size(); j++) {' +
                                                'if (_source.data[i].widgets[j].type == \"meter\")' +
                                                '_agg["test"].add((_source.data[i].widgets[j].point_cur /_source.data[i].widgets[j].point_max) * 100)  }}}',
                                            combine_script: 'sum = 0; count = 0 ; for (t in _agg.test) { sum += t; count ++ }; return sum/count',
                                            reduce_script: 'sum = 0; count = 0; for (a in _aggs) { sum += a; count++ }; return sum/count'
                                        }
                                    }
                                }
                            }
                        }
                    }
                };

                Elastic.search(options, function(error, response) {
                    console.log('ELASTIC SEARCH ERROR: ', (error) ? error.status : error);
                    if (error) return console.log('ELASTIC SECURITY AGGREGATION ERROR: ', error.displayName);
                    console.log(response.aggregations);
                    if (response.aggregations && response.aggregations.date) {
                        response.aggregations.date.buckets.forEach(function(b) {
                            console.log('-----');
                            console.log(b);
                        });
                        return callback(null, response.aggregations.date);
                    }
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

                return callback(null);
            }

        },
        function(err, results) {

            if (results.health) {
                results.health.forEach(function(obj) {
                    console.log(obj.key, obj.doc_count, 'ddddddddddddddd');

                });
            }

            // results.health _.indexBy(keyData, 'dir');

            // console.log('=====================================');
            // // console.log(err, results);
            // console.log(JSON.stringify(results));
            // console.log('=============$$$$$$$$$$$$$$$44===========');

            // results is now equals to: {one: 1, two: 2} 
        });

});
