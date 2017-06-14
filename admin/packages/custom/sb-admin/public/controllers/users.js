'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */

angular.module('mean.sb-admin')
    .controller('UsersCtrl', ['$scope', '$state', 'Sapi',
        function($scope, $state, Sapi) {

            var vmus = this;

            vmus.find = function() {
                Sapi.get({
                    cmd_api: '/users',
                    admin: true
                }).then(function(data) {
                    vmus.users = data;
                    console.log(data, 'users');
                }, function(error) {
                    console.log(error);
                });
            };
        }
    ]);
