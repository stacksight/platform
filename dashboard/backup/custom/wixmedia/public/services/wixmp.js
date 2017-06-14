'use strict';

angular.module('mean.wixmedia').factory('wixmp', [ '$uibModal',
  function ($uibModal) {
    return {
      selectImage: function (dimensions) {
        var modal = $uibModal.open({
          windowClass: 'b-wixmedia',
          resolve: {
            dimensions: function () {
              return dimensions
            }
          },
          size: 'lg',
          templateUrl: 'wixmedia/views/manager.html',
          controller: 'ManagerController'
        });

        return modal.result;
      }
    }
  }
]);
