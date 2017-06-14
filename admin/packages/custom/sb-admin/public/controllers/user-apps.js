'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */

angular.module('mean.sb-admin')
    .controller('UserCtrl', ['$scope', '$state', 'Sapi', '$stateParams',
        function($scope, $state, Sapi, $stateParams) {

            var vmu = this;

            $scope.check = function(x) {

                if (x == $scope.collapseVar)
                    $scope.collapseVar = 0;
                else
                    $scope.collapseVar = x;
            };

            vmu.find = function() {
                Sapi.get({
                    cmd_api: '/user/' + $stateParams.uid,
                    admin: true
                }).then(function(data) {
                    vmu.user = data;
                }, function(error) {
                    console.log(error);
                });
            };

            vmu.apps = function() {
                Sapi.get({
                    cmd_api: '/userApps?uid=' + $stateParams.uid,
                    admin: true
                }).then(function(data) {
                    vmu.apps = data.apps;
                    vmu.stacks = data.stacks;
                }, function(error) {
                    console.log(error);
                });
            };

        }
    ]);
