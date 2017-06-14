angular.module('mean.general').directive('scroller', ['$window',
    function($window) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var raw = element[0];
                element.bind('scroll', function () {
                    if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                        scope.$apply(attrs.scroller);
                    }
                });
            }
        };
    }]);
