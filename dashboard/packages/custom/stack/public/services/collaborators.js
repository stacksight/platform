'use strict';

angular.module('mean.stack').factory('Collaborators', ['Sapi', 'Stacks', 'Companies',
    function(Sapi, Stacks, Companies) {
        return {
            find: function(cb) {
                // stack.company.collaborators
                // stack collaborators
            },
            add: function(to, companyId, collaborators, stacks, isAdmin, cb) {
                Sapi.post({
                    cmd_api: '/companies/' + companyId + '/inviteCollaborators',
                    data: {
                        collaborators: collaborators,
                        stacks: stacks,
                        isAdmin: isAdmin,
                        to: to
                    }
                }).then(function(collaborator) {
                    cb(null, collaborator);
                }, function(error) {
                    cb(error);
                });
            },
            remove: function(_from, companyId, collaborators, stacks, cb) {
                Sapi.post({
                    cmd_api: '/companies/' + companyId + '/removeCollaborators',
                    data: {
                        collaborators: collaborators,
                        stacks: stacks,
                        from: _from
                    }
                }).then(function(collaborator) {
                    cb(null, collaborator);
                }, function(error) {
                    cb(error);
                });
            },
            updateRole: function(data, cb) {
                // data contains companyId, collaborators, action, role;
                Sapi.post({
                    cmd_api: '/companies/' + data.companyId + '/updateRole',
                    data: data
                }).then(function(collaborators) {
                    cb(null, collaborators);
                }, function(error) {
                    cb(error);
                });
            }
        };
    }
]);