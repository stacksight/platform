'use strict';

angular.module('mean.profile').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('profile', {
                url: '/profile',
                templateUrl: 'profile/views/index.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    },
                    config: function(ConfigApp) {
                        return ConfigApp.get();
                    }
                },
                controller: 'ProfileController as vm'
            }).state('profile.notifications', {
                url: '/notifications',
                templateUrl: 'profile/views/notifications.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('profile.billing', {
                url: '/billing',
                templateUrl: 'profile/views/billing.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    },
                    config: function(ConfigApp) {
                        return ConfigApp.get();
                    }
                },
                controller: 'BillingController as vmb'
            }).state('profile.general', {
                url: '/general',
                templateUrl: 'profile/views/general.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('profile.password', {
                url: '/password',
                templateUrl: 'profile/views/password.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('profile.slack', {
                url: '/slack',
                templateUrl: 'profile/views/slack.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('profile.platform', {
                url: '/platform',
                templateUrl: 'profile/views/platform.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('profile.integrations', {
                url: '/integrations',
                templateUrl: 'profile/views/integrations.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            });
    }
]);
