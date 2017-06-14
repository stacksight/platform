'use strict';

angular.module('mean.wixmedia').controller('ExampleController', ['$scope', 'wixmp',
  function($scope, wixmp) {
    $scope.images = {};
    $scope.previewHTML = 'test';
    $scope.open = function () {
      wixmp.selectImage().then(function (url) {
        alert('Image url: ' + url);
      }, function () {
        alert('Image selection failed');
      })
    };

    $scope.$watchCollection("images.asideImage", function () {
      $scope.previewHTML = ($scope.images.asideImage && $scope.images.asideImage.url)
        ? '<img src="' + $scope.images.asideImage.url + '" alt=""/>'
        : null;
    });
  }
]);
