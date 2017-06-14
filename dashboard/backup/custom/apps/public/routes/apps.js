'use strict';

angular.module('mean.apps').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('apps', {
            url: '/apps',
            templateUrl: 'apps/views/list.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app', {
            url: '/apps/:appId',
            templateUrl: 'apps/views/tabs/index.html',
            abstract: true,
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.stacks', {
            url: '/stacks',
            templateUrl: 'apps/views/tabs/stacks.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.addStack', {
            url: '/addStack/:platform',
            templateUrl: 'platforms/views/index.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.collaborators', {
            url: '/collaborators',
            templateUrl: 'apps/views/tabs/collaborators.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.inventory', {
            url: '/inventory',
            templateUrl: 'apps/views/tabs/inventory.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.settings', {
            url: '/settings',
            templateUrl: 'apps/views/tabs/settings.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.policy', {
            url: '/policy',
            templateUrl: 'apps/views/tabs/policy.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                },
                config: function(ConfigApp) {
                    return ConfigApp.get();
                }
            },
            controller: 'PolicyController as vmp'
        }).state('app.dashboard', {
            url: '/dashboard',
            templateUrl: 'apps/views/dashboard/index.html',
            abstract: true,
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.dashboard.general', {
            url: '/general',
            templateUrl: 'apps/views/dashboard/general.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.dashboard.security', {
            url: '/security',
            templateUrl: 'apps/views/dashboard/security.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.dashboard.performance', {
            url: '/performance',
            templateUrl: 'apps/views/dashboard/performance.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.dashboard.availability', {
            url: '/availability',
            templateUrl: 'apps/views/dashboard/availability.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.dashboard.seo', {
            url: '/seo',
            templateUrl: 'apps/views/dashboard/seo.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.dashboard.accessibility', {
            url: '/accessibility',
            templateUrl: 'apps/views/dashboard/accessibility.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        }).state('app.dashboard.backups', {
            url: '/backups',
            templateUrl: 'apps/views/dashboard/backups.html',
            resolve: {
                loggedin: function(Auth) {
                    return Auth.checkLoggedin();
                }
            }
        });
    }
]);
