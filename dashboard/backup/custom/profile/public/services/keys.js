'use strict';

angular.module('mean.profile').factory('Keys', ['Sapi',
  function(Sapi) {
    return {
        get: function(cb) {
            Sapi.get({
                cmd_api: '/my/keys'
            }).then(function(data) {
                cb(data);
            }, function(data) {
                cb([]);
            });
        },
        add: function(data, cb) {
            Sapi.post({
                cmd_api: '/keys',
                data: data
            }).then(function(data) {
                cb(data);
            }, function(data) {
                cb({});
            });
        }
    };
  }
]);
