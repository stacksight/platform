'use strict';

angular.module('mean.wixmedia').controller('ManagerController', ['$scope', 'Global', 'WixmediaCollections', 'FileUploader', '$uibModal', 'dimensions',
  function($scope, Global, WixmediaCollections, FileUploader, $uibModal, dimensions) {
    $scope.selectedImages = [];

    $scope.uploadInProgress = false;

    $scope.uploader = new FileUploader({
      url: '/wixmedia/upload/cc14ca_05140ce76a7e427b8e1136d74636f024',
      autoUpload: true,
      onBeforeUploadItem: function () {
        $scope.uploadInProgress = true
      },
      onCompleteAll: function () {
        $scope.uploadInProgress = false;
        reloadCollections();
      }
    });

    $scope.$watch('activeCollection', function (newCollection) {
      if (newCollection) {
        $scope.uploader.url = '/wixmedia/upload/' + newCollection.id;
      }
    });


    function reloadCollections () {
      $scope.collections = [];

      var previousId = null;
      if ($scope.activeCollection) {
        previousId = $scope.activeCollection.id;
      }

      WixmediaCollections.query().$promise.then(function (collections) {
        $scope.collections = collections;

        if (previousId) {
          for (var i = 0; i < collections.length; i++) {
            if (collections[i].id === previousId) {
              $scope.activeCollection = collections[i];
              break;
            }
          }
        }

        if (!$scope.activeCollection && $scope.collections[0]) {
          $scope.activeCollection = $scope.collections[0];
        }
      }, function (response) {
        if (response.data && response.data.error === 'configuration') {
          $uibModal.open({
            size: 'lg',
            templateUrl: 'wixmedia/views/firsttime.html',
            controller: 'SettingsWixController',
            resolve: {
              settings: ['Wixmedia', function (Wixmedia) {
                return Wixmedia.getSettings();
              }]
            }
          });
          $scope.$dismiss();
        } else {
          $scope.$dismiss();
          alert('Something wrong happened! Check your settings please');
        }
      });
    }

    reloadCollections();


    $scope.selectImage = function (item) {
      var index = $scope.selectedImages.indexOf(item);
      if (index !== -1) {
        $scope.selectedImages.splice(index, 1);
      } else {
        $scope.selectedImages.push(item);
      }
    };


    $scope.selectFolder = function (item) {
      if (item === $scope.activeCollection) {
        return;
      }

      $scope.activeCollection = item;
      $scope.selectedImages = [];
    };

    $scope.addNewFolder = function () {
      $scope.collections = [];
      var title = prompt('Enter new folder title');
      if (!title) {
        return;
      }

      WixmediaCollections.save({ title: title }).$promise.then(reloadCollections);
    };

    $scope.removeFolder = function (item) {
      if (item.public_properties.persist) {
        return;
      }

      if(!window.confirm('Are you sure you want to remove this folder?')) {
        return;
      }

      if ($scope.activeCollection === item) {
        $scope.activeCollection = null;
      }

      WixmediaCollections.remove({ id: item.id }).$promise.then(reloadCollections);
    };

    $scope.proceed = function () {
      var modal = $uibModal.open({
        windowClass: 'b-wixmedia',
        size: 'lg',
        templateUrl: 'wixmedia/views/image.html',
        controller: 'ImageController',
        resolve: {
          images: function () { return $scope.selectedImages },
          dimensions: function () { return dimensions }
        }
      });
      $scope.$close(modal.result);
    }
  }
]);
