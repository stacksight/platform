'use strict';

angular.module('mean.sapi').factory('Sapi', ['$http', '$q',
    function($http, $q) {
        return {
            get: function(options) {
                var deferred = $q.defer();
                options.cmd_api = (options.admin) ? '/admin' + options.cmd_api : options.cmd_api;

                $http.get('/sapi' + options.cmd_api).success(function(data) {
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
                options.cmd_api = (options.admin) ? '/admin' + options.cmd_api : options.cmd_api;


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
                options.cmd_api = (options.admin) ? '/admin' + options.cmd_api : options.cmd_api;

                $http.post('/sapi' + options.cmd_api, options.data).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status) {
                    deferred.reject({
                        message: data.error,
                        status: status
                    });
                });
                return deferred.promise;
            },

            delete: function(options) {
                var deferred = $q.defer();
                options.cmd_api = (options.admin) ? '/admin' + options.cmd_api : options.cmd_api;

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
