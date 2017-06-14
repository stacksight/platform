'use strict';

/* jshint -W098 */
angular.module('mean.dashboard').controller('DashboardController', ['$scope', 'Global', 'Dashboard',
  function($scope, Global, Dashboard) {
    $scope.global = Global;
    $scope.package = {
      name: 'dashboard'
    };
  }
]);
