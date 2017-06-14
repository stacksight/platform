'use strict';

/* jshint -W098 */
angular.module('mean.sb-admin').controller('SbAdminController', ['$scope', 'Global', 'SbAdmin',
  function($scope, Global, SbAdmin) {
    $scope.global = Global;
    $scope.package = {
      name: 'sb-admin'
    };
  }
]);
