'use strict';

angular.module('mean.apps').factory('Appsun', ['Sapi', '$q', '$http', '$location',
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
                    cmd_api: '/Appsun/aggs/' + name + '/' + options.id + '/' + options.index + '/' + options.type
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
            query = JSON.parse(JSON.stringify(options.query));
            query = JSON.stringify(query);

            console.log('appSunData');
            console.log(options);
            Sapi.get({
                cmd_api: '/Appsun/search/' + options.id + '/' + options.index + '/' + options.type + '?size=' + options.size + '&from=' + options.from + '&range=' + options.range + '&filters=' + query
            }).then(function(docs) {
                // console.log('success', docs);
                cb(docs);
            }, function(data) {
                console.log('failed', data);
                cb([]);
            });
        }

    }
]);
