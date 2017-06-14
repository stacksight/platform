'use strict';

angular.module('mean.stacks').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('company', {
      url: '/company/:companyId',
      template: '<ui-view></ui-view>',
      abstract: true,
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('company.main', {
      url: '',
      templateUrl: 'stacks/views/index.html',
      abstract: true,
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('company.main.dashboard', {
      url: '/dashboard?search',
      templateUrl: 'stacks/views/dashboard.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('company.main.dashboard.tour', {
      url: '/tour',
      templateUrl: 'stacks/views/dashboard.html',
      resolve: {
        loggedin: function(ShowHits, Auth) {
          ShowHits.clear();
          ShowHits.show();
          return Auth.checkLoggedin();
        }
      }
    }).state('company.main.dashboard.withparam?search', {
      url: '/:param',
      templateUrl: 'stacks/views/dashboard.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('company.main.inventory', {
      url: '/inventory',
      templateUrl: 'stacks/views/inventory.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    }).state('company.main.people', {
      url: '/people',
      templateUrl: 'stacks/views/people.html',
      controller: 'PeopleController as vmc',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        },
        company: getCompanyData
      }
    });

    function getCompanyData(Companies, $stateParams) {
      return Companies.findOne($stateParams.companyId);
    }
  }
]);