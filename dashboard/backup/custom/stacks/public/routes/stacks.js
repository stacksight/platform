'use strict';

angular.module('mean.stacks').config(['$stateProvider',
    function($stateProvider) {
        var integrationsControllers = {
            platform: 'IntegrationsPlatformController as vmip',
            github: 'IntegrationsGihubController as vmigh',
            bitbucket: 'IntegrationsBitbucketController as vmibb',
        };
        $stateProvider.state('stacks', {
                url: '/stacks',
                templateUrl: 'stacks/views/index.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack', {
                url: '/stacks/:id',
                abstract: true,
                templateUrl: 'stacks/views/tabs/index.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.events', {
                url: '/events',
                templateUrl: 'stacks/views/tabs/events.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.logs', {
                url: '/logs',
                templateUrl: 'stacks/views/tabs/logs.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.sessions', {
                url: '/sessions',
                templateUrl: 'stacks/views/tabs/sessions.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.health', {
                url: '/health',
                abstract: true,
                templateUrl: 'stacks/views/health/index.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.health.type', {
                url: '/:type',
                templateUrl: function($stateParams) {
                    return 'stacks/views/health/health.html';
                },
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.updates', {
                url: '/updates',
                templateUrl: 'stacks/views/tabs/updates.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.settings', {
                url: '/settings',
                templateUrl: 'stacks/views/tabs/settings.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.integrations', {
                url: '/integrations',
                templateUrl: 'stacks/views/tabs/integrations/index.html',
                abstract: true,
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.integrations.main', {
                url: '/main',
                templateUrl: 'stacks/views/tabs/integrations/main.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.integrations.service', {
                url: '/:service',
                controllerProvider: function($stateParams) {
                    if (integrationsControllers[$stateParams.service]) return integrationsControllers[$stateParams.service];
                    return '';
                },
                template: '<ui-view ng-init="vmi.findIntegration(vmi.$stateParams.service);"></ui-view>',
                abstract: true,
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.integrations.service.settings', {
                url: '/settings',
                templateUrl: function($stateParams) {
                    return 'stacks/views/tabs/integrations/settings.html'
                },
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.builds', {
                url: '/builds',
                templateUrl: 'stacks/views/tabs/integrations/index.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.builds.service', {
                url: '/:service',
                controllerProvider: function($stateParams) {
                    if (integrationsControllers[$stateParams.service]) return integrationsControllers[$stateParams.service];
                    return '';
                },
                templateUrl: function($stateParams) {
                    return 'stacks/views/tabs/integrations/' + $stateParams.service + '.html'
                },
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.availability', {
                url: '/availability',
                templateUrl: 'stacks/views/tabs/availability.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            }).state('stack.inventory', {
                url: '/inventory',
                templateUrl: 'stacks/views/tabs/inventory.html',
                resolve: {
                    loggedin: function(Auth) {
                        return Auth.checkLoggedin();
                    }
                }
            });
    }
]);
