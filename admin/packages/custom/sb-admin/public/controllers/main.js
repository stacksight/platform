'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */

angular.module('mean.sb-admin')
    .controller('MainCtrl', ['$scope', '$uibPosition', '$state', 'Sapi',
        function($scope, $uibPosition, $state, Sapi) {

            var vm = this;

            vm.init = function() {
                Sapi.get({
                    cmd_api: '/counts',
                    admin: true
                }).then(function(data) {
                    vm.entitiesCount = data;
                }, function(error) {
                    console.log(error);
                });
            };

            vm.moveToState = function(name) {
                $state.go(name);
            };

        }
    ]);
