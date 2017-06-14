'use strict';

angular.module('mean.wixmedia').controller('SettingsWixController', ['$scope', 'settings', 'Wixmedia',
  function($scope, settings, Wixmedia) {
    $scope.settings = settings;

    $scope.save = function () {
      Wixmedia.saveSettings($scope.settings).then(function () {
        $scope.result = 'success';
        if ($scope.$close) {
          $scope.$close();

        }
      }, function () {
        $scope.result = 'error';
      });
    }
  }
]);
