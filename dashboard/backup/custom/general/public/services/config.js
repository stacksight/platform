'use strict';

angular.module('mean.general').factory('ConfigApp', ['Sapi', '$q',
    function(Sapi, $q) {
        var config;

        return {
            get: function() {
                var deferred = $q.defer();
                if (config) deferred.resolve(config);
                else
                    Sapi.get({
                        cmd_api: '/sapi/config'
                    }).then(function(data) {
                        config = data;
                        deferred.resolve(config); 
                    }, function(err) {
                        deferred.reject(err); 
                    });       
                return deferred.promise;

            }
        };
    }
]);