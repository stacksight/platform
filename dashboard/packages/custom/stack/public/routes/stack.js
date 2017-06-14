'use strict';

angular.module('mean.stack').config(['$stateProvider',
  function($stateProvider) {
    var integrationsControllers = {
      platform: 'IntegrationsPlatformController as vmip',
      github: 'IntegrationsGihubController as vmigh',
      bitbucket: 'IntegrationsBitbucketController as vmibb',
    };
    $stateProvider.state('stack', {
      url: '/stack/:id',
      templateUrl: 'stack/views/index.html',
      abstract: true,
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.dashboard', {
      url: '',
      templateUrl: 'stack/views/dashboard.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.events', {
      url: '/events',
      templateUrl: 'stack/views/tabs/events.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.people', {
      url: '/people',
      controller: 'StackPeopleController as vmp',
      templateUrl: 'stack/views/people.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        },
        company: getCompanyData
      }
    }).state('stack.peoplewithparam', {
      url: '/people/:param',
      controller: 'StackPeopleController as vmp',
      templateUrl: 'stack/views/people.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        },
        company: getCompanyData
      }
    }).state('stack.logs', {
      url: '/logs',
      templateUrl: 'stack/views/tabs/logs.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.sessions', {
      url: '/sessions',
      templateUrl: 'stack/views/tabs/sessions.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.health', {
      url: '/health',
      abstract: true,
      templateUrl: 'stack/views/health/index.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.health.type', {
      url: '/:type',
      templateUrl: function($stateParams) {
        return 'stack/views/health/health.html';
      },
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.updates', {
      url: '/updates',
      templateUrl: 'stack/views/tabs/updates.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.settings', {
      url: '/settings',
      templateUrl: 'stack/views/tabs/settings.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.integrations', {
      url: '/integrations',
      templateUrl: 'stack/views/tabs/integrations/index.html',
      abstract: true,
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.integrations.main', {
      url: '/main',
      templateUrl: 'stack/views/tabs/integrations/main.html',
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
        return 'stack/views/tabs/integrations/settings.html'
      },
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.builds', {
      url: '/builds',
      templateUrl: 'stack/views/tabs/integrations/index.html',
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
        return 'stack/views/tabs/integrations/' + $stateParams.service + '.html'
      },
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.availability', {
      url: '/availability',
      templateUrl: 'stack/views/tabs/availability.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('stack.inventory', {
      url: '/inventory',
      templateUrl: 'stack/views/tabs/inventory.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    });

    function getCompanyData(Companies, Global) {
      return Companies.findOne(Global.user.companies[0].id);
    }
  }
]);
