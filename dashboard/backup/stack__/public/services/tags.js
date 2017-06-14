'use strict';

angular.module('mean.stack').factory('Tags', ['Sapi', 'Stacks',
    function(Sapi, Stacks) {
        return {
            find: function(company, type, text, cb) {
                var url = '';
                if(company.id == 'all'){
                    url = 'sapi/tags/all?text=' + text;
                } else if(type == 'stack' || type == 'stacks'){
                    url = 'sapi/tags/'+ company.id +'?text=' + text;
                }
                if(url){
                    Sapi.get({
                        cmd_api: url
                    }).then(function(data) {
                        return cb(null, data);
                    }, function(data) {
                        return cb(data);
                    });
                }
            },

            create: function(tag, stack, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'add',
                    array: 'tags',
                    key: 'tag',
                    tag: tag
                };
                Sapi.post({
                    cmd_api: '/tags/' + stack._id,
                    data: data
                }).then(function(data) {
                    cb(null, data);
                }, function(err) {
                    cb(err);
                });
            },
            add: function(tag, stack, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'add',
                    object: tag,
                    array: 'tags',
                    key: 'tag'
                };
                Stacks.update(stack._id, data, function(err, data) {
                    if (err) return cb(err);
                    cb(null, data);
                });

            },
            remove: function(tag, stack, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'remove',
                    object: tag,
                    array: 'tags',
                    key: 'tag'
                };
                Stacks.update(stack._id, data, function(err, data) {
                    if (err) return cb(err);
                    cb(null);
                });
            }
        };
    }
]);
