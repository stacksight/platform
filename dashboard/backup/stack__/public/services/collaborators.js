'use strict';

angular.module('mean.stack').factory('Collaborators', ['Sapi', 'Stacks',
    function(Sapi, Stacks) {
        return {
            find: function(cb) {
                // stack.company.collaborators
                // stack collaborators
            },
            add: function(collaborator, stack, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'add',
                    object: collaborator,
                    array: 'collaborators',
                    key: 'email'
                };
                Stacks.update(stack._id, data, function(err, data) {
                    if (err) return cb(err);
                    var exists = false;
                    stack.collaborators.forEach(function(c) {
                        if (c.email === collaborator.email) exists = true;
                    });
                    if (!exists) {
                        collaborator.status = 'pending';
                        return cb(null, collaborator);
                    }
                    cb(null);
                });
            },
            remove: function(collaborator, stack, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'remove',
                    object: collaborator,
                    array: 'collaborators',
                    key: 'email'
                };
                Stacks.update(stack._id, data, function(err, data) {
                    if (err) return cb(err);
                    for (var i in stack.collaborators) {
                        if (stack.collaborators[i].email === collaborator.email) {
                            return cb(null, i);
                        }
                    }
                });
            },
            update: function(collaborator, stack, cb) {
                var data = {
                    action: 'updateArray',
                    updateAction: 'update',
                    object: collaborator,
                    array: 'collaborators',
                    key: 'email'
                };
                Stacks.update(stack._id, data, function(err, data) {
                    if (err) return cb(err);
                    cb(null, data);
                });
            }
        };
    }
]);
