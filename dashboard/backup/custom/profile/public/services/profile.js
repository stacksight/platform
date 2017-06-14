'use strict';

angular.module('mean.profile').factory('Profile', ['$http', '$q', 'Sapi',
    function($http, $q, Sapi) {
        return {
            save: function(profile) {
                var deferred = $q.defer();

                $http.put('/profile', profile).success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            update: function(user, cb) {
                Sapi.put({
                    cmd_api: '/user',
                    data: user
                }).then(function(data) {
                    cb(null, data);
                }, function(data) {
                    cb(data);
                });
            }
        };
    }
]);