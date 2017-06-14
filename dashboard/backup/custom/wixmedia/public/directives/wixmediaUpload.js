'use strict';

angular.module('mean.wixmedia').directive('imageonload', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        scope.$apply(attrs.imageonload);
      });
    }
  };
});
