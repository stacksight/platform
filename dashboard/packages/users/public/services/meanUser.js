'use strict';

angular.module('mean.users').factory('MeanUser', ['$q', 'Sapi', 'Global',

    function($q, Sapi, Global) {
        return {
            me: function() {
                var defered = $q.defer();
                if (Global.user && Global.user._id) {
                    Sapi.get({
                        cmd_api: '/sapi/user'
                    }).then(function(data) {
                        defered.resolve(data);
                    }, function(err) {
                        defered.reject(err);
                    });
                } else
                    defered.reject('user is not authorized');
                return defered.promise;
            },
            setProperty: function(key, value) {
                window.user[key] = value;
                Global.user[key] = value;
            },
            visit: function() {
                if (!Global.user || !Global.user._id) return;
                Sapi.put({
                    cmd_api: '/user',
                    data: {
                        lastVisit: true
                    }
                }).then(function(data) {}, function(err) {});
            }
        };
    }
]);