'use strict';

angular.module('mean.apps').factory('Inventory', ['Sapi', 'Apps', 'Appsun',
    function(Sapi, Apps, Appsun) {
        return {
            search: function(options, cb) {
                var cmd_api = '/sapi/inventory/' + options.appId + '/search?&name=' + options.name + '&populate=author';
                cmd_api += (options.version) ? '&version=' + options.version : '';
                Sapi.get({
                    cmd_api: cmd_api,
                    data: options.ids
                }).then(function(data) {
                    cb(null, data);
                }, function(data) {
                    cb(data);
                });
            },
            info: function(groupId, cb) {
                var cmd_api = '/sapi/inventory/' + groupId + '/info?&populate=author';
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
