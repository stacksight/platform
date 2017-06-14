'use strict';

/* jshint -W098 */
angular.module('mean.apps').controller('CollaboratorsController', ['$scope', 'Global', '$stateParams', 'Collaborators', 'Apps',
    function($scope, Global, $stateParams, Collaborators, Apps) {

        var vmc = this;
        vmc.global = Global;
        var appId = $stateParams.appId;
        var vm = $scope.vm; //appsController scope
        vmc.collaborator = {
            permissions: ['viewer']
        };

        vmc.permissions = ['admin', 'viewer'];

        vmc.find = function() {
            Collaborators.find(function(err, data) {
                if (err) return console.log(err);
                vmc.collaborators = data;
            });
        };

        vmc.add = function(valid) {
            if (!valid) return console.log('Email is not valid');
            if (vmc.global.user.email === vmc.collaborator.email) return swal('Oops...', "You can't invite yourself!", "error");

            vmc.disableInvitation = true;

            Collaborators.add(vmc.collaborator, vm.app, function(err, collaborator) {
                vmc.disableInvitation = false;
                if (err) return console.log('update app err', err);
                swal('', 'an invitation was sent to ' + vmc.collaborator.email, 'success');
                if (collaborator) vm.app.collaborators.push(collaborator);
                vmc.collaborator = {};
            });
        };

        vmc.remove = function(collaborator) {

            Collaborators.remove(collaborator, vm.app, function(err, i) {
                if (err) return console.log('update app err', err);
                vm.app.collaborators.splice(i, 1);
            });
        };

        vmc.update = function(collaborator) {

            Collaborators.update(collaborator, vm.app, function(err, data) {
                if (err) return console.log('update app err', err);
            });
        };
    }
]);
