'use strict';

angular.module('mean.stacks').factory('Inventory', ['Sapi', 'Apps', 'Appsun', 'Serialize',
    function(Sapi, Apps, Appsun, Serialize) {

        return {
            search: function(options, cb) {
                var cmd_api = '/sapi/inventory/search?' + Serialize.obj2qs(options);
                Sapi.get({
                    cmd_api: cmd_api
                }).then(function(data) {
                    cb(null, data);
                }, function(data) {
                    cb(data);
                });
            },
            info: function(options, cb) {
                var cmd_api = '/sapi/inventory/info?' + Serialize.obj2qs(options);
                Sapi.get({
                    cmd_api: cmd_api
                }).then(function(data) {
                    cb(null, data);
                }, function(data) {
                    cb(data);
                });
            },
            sendEmail: function(group, emails, body, cb) {
                var cmd_api = '/notify/email/' + group;
                Sapi.post({
                    cmd_api: cmd_api,
                    data: {
                        emails: emails,
                        body: body
                    }
                }).then(function(data) {
                    cb(null, data);
                }, function(data) {
                    cb(data);
                });

            }
        };
    }
]);