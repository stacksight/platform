'use strict';

angular.module('mean.wixmedia').controller('ImageController', ['$scope', 'Global', '$uibModal', 'images', 'dimensions',
  function($scope, Global, $uibModal, images, dimensions) {
    if (dimensions && dimensions.width) {
      dimensions.width = +dimensions.width;
    }

    if (dimensions && dimensions.height) {
      dimensions.height = +dimensions.height;
    }


    function applyParams (imageRecord) {
      var BASE_URL = 'http://media.wixapps.net/' + imageRecord.public_properties.user + '/images';
      var image = wixmedia.WixImage(BASE_URL, imageRecord.public_properties.image, imageRecord.public_properties.fileName);
      var params = $scope.params;

      var resultImage = image[params.mode]();

      if (params.mode === 'fit' || params.mode === 'fill') {
        if (params.algorithm !== 'auto') {
          resultImage.rf(params.algorithm);
        }
      }

      if (params.mode === 'fill' || params.mode === 'canvas') {
        resultImage.al(params.fill_alignment);
      }

      if (params.mode === 'canvas') {
        var color = params.canvas_color ? params.canvas_color.replace('#', '') : null;
        resultImage.c(color);
      }


      if (params.mode === 'crop') {
        resultImage.x(params.crop_x).y(params.crop_y);
      }

      resultImage.w(params.width).h(params.height);

      //JPEG options
      resultImage.q(params.quality);
      if (!params.progressive) {
        resultImage.bl();
      }

      if (params.brightness !== 0) {
        resultImage.br(params.brightness)
      }

      if (params.contrast !== 0) {
        resultImage.con(params.contrast)
      }

      if (params.saturation !== 0) {
        resultImage.sat(params.saturation)
      }

      if (params.hue !== 0) {
        resultImage.hue(params.hue);
      };

      if (params.oil) {
        resultImage.oil();
      }

      if (params.neg) {
        resultImage.neg();
      }

      return resultImage.toUrl();
    }

    $scope.editedImages = [];
    $scope.images = images;
    $scope.updateInProgress = false;
    var dimensions = dimensions || {};
    $scope.params = {
      width: dimensions.width || 300,
      height: dimensions.height || 300,
      mode: 'fit',
      algorithm: 'auto',
      quality: 75,
      progressive: true,
      fill_alignment: 'c',
      canvas_color: '#000000',
      crop_x: 0,
      crop_y: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0
    };


    $scope.changeImage = function () {
      var modal = $uibModal.open({
        windowClass: 'b-wixmedia',
        size: 'lg',
        templateUrl: 'wixmedia/views/manager.html',
        resolve: {
          dimensions: function () { return dimensions }
        },
        controller: 'ManagerController'
      });

      $scope.$close(modal.result);
    };

    $scope.syncImage = function () {
      $scope.backgroundImage = $scope.editedImages[0];
      $scope.updateInProgress = false;
    };

    $scope.$watchCollection('params', function () {
      $scope.editedImages = $scope.images.map(applyParams);
      $scope.previewHTML = $scope.editedImages.length === 1 ? '<img src="' + $scope.editedImages[0] + '" alt=""/>' : null;

    });

    $scope.proceed = function () {
      $scope.$close($scope.editedImages.length === 1 ? $scope.editedImages[0] : $scope.editedImages);
    };
  }
]);
