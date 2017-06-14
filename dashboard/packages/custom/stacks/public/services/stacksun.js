'use strict';

angular.module('mean.stacks').factory('Stacksun', ['Sapi', '$q', '$http', '$location',
    function(Sapi, $q, $http, $location) {

        var sessions;

        return {
            logs: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            sessions: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            events: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            updates: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            health: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            repository: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            inventory: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            platform: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            github: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            bitbucket: function(options, cb) {
                var data = {};
                appSunData(options, function(docs) {
                    data.docs = docs;
                    cb(data);
                });
            },
            aggregation: function(name, options, cb) {
                Sapi.get({
                    cmd_api: getCmdApiUri(name, options)
                }).then(function(data) {
                    cb(data);
                }, function(data) {
                    cb([]);
                });

            }
        };

        function appSunData(options, cb) {

            var query;
            options.query = options.query || {};
            if (options.query.ids) options.ids = options.query.ids;
            delete options.query.ids;
            query = JSON.parse(JSON.stringify(options.query));
            query = JSON.stringify(query);

            var cmd_api = '/sapi/stacksun/search/' + options.index + '/' + options.type + '?size=' + options.size + '&from=' + options.from + '&range=' + options.range + '&filters=' + query;
            cmd_api+= (options.ids) ? ('&ids=' + options.ids) : '';
            
            Sapi.get({
                cmd_api: cmd_api
            }).then(function(docs) {
                // console.log('success', docs);
                cb(docs);
            }, function(data) {
                console.log('failed', data);
                cb([]);
            });
        }

        function getCmdApiUri(name, options) {

            var cmd_api = '/sapi/stacksun/aggs/' + name + '/' + options.index + '/' + options.type;
            if (name !== 'inventory') return cmd_api;

            var query, company;
            options.query = options.query || {};
            company = options.query.company;
            if (options.query.ids) options.ids = options.query.ids;
            delete options.query.ids;
            query = JSON.parse(JSON.stringify(options.query));
            query = JSON.stringify(query);

            cmd_api += '?size=' + options.size + '&from=' + options.from + '&range=' + options.range + '&filters=' + query;
            cmd_api += (options.ids) ? ('&ids=' + options.ids) : '';
            cmd_api += (company) ? ('&company=' + company) : '';
            return cmd_api;
        }

    }
]);
