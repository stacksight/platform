'use strict';

angular.module('mean.wixmedia').factory('WixmediaCollections', [ '$resource',
  function ($resource) {
    return $resource('/wixmedia/collections/:id');
  }
]);
