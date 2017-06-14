'use strict';

/* jshint -W098 */
angular.module('mean.apps').controller('AppsController', ['$scope', 'Global', 'Apps', '$stateParams', 'Platforms', '_', '$state', 'Stacks', 'Updates', 'localStorageService', 'Sapi',
    function ($scope, Global, Apps, $stateParams, Platforms, _, $state, Stacks, Updates, localStorageService, Sapi) {
        var vm = this;

        $scope.global = Global;
        $scope.$state = $state;
        $scope.env = $stateParams.env;
        $scope.$params = $stateParams;


        vm.stacks = {};
        vm.selected_stacks_count = 0;

        vm.find = function(){
            $scope.global = Global;
            Stacks.find(function(err, data) {
               if(err){
                   return console.log('find stacks error', err);
               } else{
                   vm.stacks = data;
               }
            });
        }

        vm.action_for_stacks = [
            {
                action_name: 'update',
                title: 'Update',
                action: function(){
                    console.log('update');
                }
            },
            {
                action_name: 'delete',
                title: 'Delete',
                action: function(){
                    console.log('delete');
                }
            }
        ];

        vm.sideBarData = {
            tabs: [{
                title: 'Dashboard',
                link: 'apps',
                platforms: ['all'],
                params: {
                    appId: $stateParams.appId
                }
            }, {
                title: 'Inventory',
                link: 'apps.inventory',
                platforms: ['all'],
                params: {
                    appId: $stateParams.appId
                }
            }, {
                title: 'People',
                link: 'apps.collaborators',
                platforms: ['all'],
                params: {
                    appId: $stateParams.appId
                }
            }]
        };
    }
]);