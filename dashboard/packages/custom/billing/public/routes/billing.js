'use strict';

angular.module('mean.billing').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('billing example page', {
            url: '/billing/example',
            templateUrl: 'billing/views/index.html'
        });

        $stateProvider.state('plans', {
            url: '/plans',
            templateUrl: 'stripe/views/plans.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                },
                config: function(ConfigApp) {
                    return ConfigApp.get();
                }
            },
            controller: 'BillingController as vmb'
        });

        $stateProvider.state('upgrade plan', {
            url: '/plans/upgrade/:id',
            templateUrl: 'billing/views/upgrade.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                },
                config: function(ConfigApp) {
                    return ConfigApp.get();
                }
            },
            controller: 'BillingController as vmb'

        });
    }
]);