'use strict';

angular.module('mean.wixmedia').factory('Wixmedia', [ '$http',
  function ($http) {
    return {
      getSettings: function () {
        return $http.get('/wixmedia/settings').then(function (response) { return response.data; });
      },

      saveSettings: function (data) {
        return $http.post('/wixmedia/settings', data);
      }
    }
  }
]);
