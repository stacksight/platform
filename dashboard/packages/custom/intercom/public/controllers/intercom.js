'use strict';

/* jshint -W098 */
angular.module('mean.intercom').controller('IntercomController', ['$scope', 'Global', 'Intercom',
  function($scope, Global, Intercom) {
    $scope.global = Global;
    $scope.package = {
      name: 'intercom'
    };
  }
]);
