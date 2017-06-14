'use strict';

angular.module('mean.sapi').factory('Sapi', ['$http', '$q',
    function($http, $q) {
        return {
            get: function(options) {
                var deferred = $q.defer();

                $http.get(options.cmd_api).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status) {
                    deferred.reject({
                        message: data.error,
                        status: status
                    });
                });

                return deferred.promise;
            },

            put: function(options) {
                var deferred = $q.defer();

                $http.put('/sapi' + options.cmd_api, options.data).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status) {
                    deferred.reject({
                        message: data.error,
                        status: status
                    });
                });
                return deferred.promise;
            },

            post: function(options) {
                var deferred = $q.defer();

                $http.post('/sapi' + options.cmd_api, options.data).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status) {
                    if (data.error)
                        deferred.reject({
                            message: data.error,
                            status: status
                        });
                    else deferred.reject(data);
                });
                return deferred.promise;
            },

            delete: function(options) {
                var deferred = $q.defer();

                $http.delete('/sapi' + options.cmd_api).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status) {
                    deferred.reject({
                        message: data.error,
                        status: status
                    });
                });
                return deferred.promise;
            }
        };
    }
]);