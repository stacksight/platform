'use strict';

angular.module('mean.stacks').factory('Availability', ['Sapi', '$q',
    function(Sapi, $q) {
        return {
            get: function(check, cb) {
                Sapi.get({
                    cmd_api: '/availability/' + check
                }).then(function(data) {
                    return cb(null, data);
                }, function(data) {
                    cb(data);
                });
            }
        };
    }
]);
