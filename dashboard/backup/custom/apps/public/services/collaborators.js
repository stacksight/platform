'use strict';

angular.module('mean.apps').factory('Collaborators', ['Sapi', 'Apps',
    function(Sapi, Apps) {
        return {
            find: function(cb) {
                Sapi.get({
                    cmd_api: '/sapi/users'
                }).then(function(data) {
                    cb(null, data);
                }, function(data) {
                    cb(data);
                });
            },
            add: function(collaborator, app, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'add',
                    object: collaborator,
                    array: 'collaborators',
                    key: 'email'
                };
                Apps.update(app._id, data, function(err, data) {
                    if (err) return cb(err);
                    var exists = false;
                    app.collaborators.forEach(function(c) {
                        if (c.email === collaborator.email) exists = true;
                    });
                    if (!exists) {
                        collaborator.status = 'pending';
                        return cb(null, collaborator);
                    }
                    cb(null);
                });

            },
            remove: function(collaborator, app, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'remove',
                    object: collaborator,
                    array: 'collaborators',
                    key: 'email'
                };
                Apps.update(app._id, data, function(err, data) {
                    if (err) return cb(err);
                    for (var i in app.collaborators) {
                        if (app.collaborators[i].email === collaborator.email) {
                            return cb(null, i);
                        }
                    }
                });
            },
            update: function(collaborator, app, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'update',
                    object: collaborator,
                    array: 'collaborators',
                    key: 'email'
                };
                Apps.update(app._id, data, function(err, data) {
                    if (err) return cb(err);
                    cb(null, data);
                });
            }
        };
    }
]);
