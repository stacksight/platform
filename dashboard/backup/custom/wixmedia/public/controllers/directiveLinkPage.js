'use strict';

angular.module('mean.wixmedia').controller('DirectiveLinkPage', ['$scope', 'params',
  function($scope, params) {
    $scope.form = params || { href: '', target: '_blank'};
    $scope.form.target = $scope.form.target || '_blank';

    $scope.ok = function () {
      $scope.$close($scope.form);
    }
  }
]);
