// 'use strict';

// angular.module('mean.sb-admin').config(['$stateProvider',
//   function($stateProvider) {
//     $stateProvider.state('sbAdmin example page', {
//       url: '/sbAdmin/example',
//       templateUrl: 'sb-admin/views/index.html'
//     });
//   }
// ]);
'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 */

angular
    .module('sbAdminApp', [
        'oc.lazyLoad',
        'ui.router',
        'ui.bootstrap',
        'angular-loading-bar',
    ])
    .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {

        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
        });

        $urlRouterProvider.otherwise('/dashboard/home');

        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'sb-admin/views/dashboard/main.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.home', {
                url: '/home',
                controller: 'MainCtrl',
                controllerAs: 'vm',
                templateUrl: 'sb-admin/views/dashboard/home.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.users', {
                url: '/users',
                controller: 'UsersCtrl',
                controllerAs: 'vmus',
                templateUrl: 'sb-admin/views/dashboard/users.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.user apps', {
                url: '/user/:uid',
                controller: 'UserCtrl',
                controllerAs: 'vmu',
                templateUrl: 'sb-admin/views/dashboard/user-apps.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.form', {
                templateUrl: 'sb-admin/views/form.html',
                url: '/form',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.blank', {
                templateUrl: 'sb-admin/views/pages/blank.html',
                url: '/blank',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('login', {
                templateUrl: 'sb-admin/views/pages/login.html',
                url: '/login',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedOut();
                    }
                }
            })
            .state('dashboard.chart', {
                templateUrl: 'sb-admin/views/chart.html',
                url: '/chart',
                controller: 'ChartCtrl',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.table', {
                templateUrl: 'sb-admin/views/table.html',
                url: '/table',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.panels-wells', {
                templateUrl: 'sb-admin/views/ui-elements/panels-wells.html',
                url: '/panels-wells',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.buttons', {
                templateUrl: 'sb-admin/views/ui-elements/buttons.html',
                url: '/buttons',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.notifications', {
                templateUrl: 'sb-admin/views/ui-elements/notifications.html',
                url: '/notifications',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.typography', {
                templateUrl: 'sb-admin/views/ui-elements/typography.html',
                url: '/typography',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.icons', {
                templateUrl: 'sb-admin/views/ui-elements/icons.html',
                url: '/icons',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
            .state('dashboard.grid', {
                templateUrl: 'sb-admin/views/ui-elements/grid.html',
                url: '/grid',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            })
    }]);
