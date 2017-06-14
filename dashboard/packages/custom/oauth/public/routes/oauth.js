'use strict';

angular.module('mean.oauth').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('slack oauth', {
      url: '/oauth/slack',
      templateUrl: 'oauth/views/index.html',
      resolve: {
        loggedin: function(Auth) {
          return Auth.checkLoggedin();
        }
      }
    });
  }
]);
