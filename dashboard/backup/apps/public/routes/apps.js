'use strict';

angular.module('mean.apps').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('apps', {
            url: '/stacks',
            templateUrl: 'apps/views/tabs/index.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('apps.collaborators', {
            url: '/collaborators',
            templateUrl: 'apps/views/tabs/collaborators.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('apps.inventory', {
            url: '/inventory',
            templateUrl: 'apps/views/tabs/inventory.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        });
    }
]);
