'use strict';

angular.module('mean.intercom').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('intercom example page', {
      url: '/intercom/example',
      templateUrl: 'intercom/views/index.html'
    });
  }
]);
