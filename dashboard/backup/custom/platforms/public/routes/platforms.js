'use strict';

angular.module('mean.platforms').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('platforms example page', {
      url: '/platforms/example',
      templateUrl: 'platforms/views/index.html'
    });
  }
]);
